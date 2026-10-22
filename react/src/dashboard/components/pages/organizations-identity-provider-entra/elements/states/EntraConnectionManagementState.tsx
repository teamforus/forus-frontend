import useTranslate from '../../../../../hooks/useTranslate';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import useConfirmDangerAction from '../../../../../hooks/useConfirmDangerAction';
import useIdentityProviderAction from '../../hooks/useIdentityProviderAction';
import { ApiResponseSingle, ResponseError } from '../../../../../props/ApiResponses';
import usePushApiError from '../../../../../hooks/usePushApiError';
import type IdentityProviderConnection from '../../../../../props/models/IdentityProvider/IdentityProviderConnection';
import type { IdentityProviderAccountType } from '../../../../../props/models/IdentityProvider/IdentityProviderScimCredential';
import { useIdentityProviderConnectionService } from '../../../../../services/IdentityProviderConnectionService';
import EntraConnectionCard from '../cards/EntraConnectionCard';
import EntraEventsCard from '../cards/EntraEventsCard';
import EntraWebshopsCard from '../cards/EntraWebshopsCard';
import EntraProvisioningCard from '../cards/EntraProvisioningCard';

type ConnectionActionResponse = ApiResponseSingle<IdentityProviderConnection>;

const credentialKeys = {
    requester: 'scim_credential_requester',
    employee: 'scim_credential_employee',
} as const;

export default function EntraConnectionManagementState({
    connection,
    onConnectionChange,
    organizationId,
    employeeProvisioningAllowed,
    requesterProvisioningAllowed,
}: {
    connection: IdentityProviderConnection;
    onConnectionChange: (connection: IdentityProviderConnection | null) => void;
    organizationId: number;
    employeeProvisioningAllowed: boolean;
    requesterProvisioningAllowed: boolean;
}) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const confirmDangerAction = useConfirmDangerAction();

    const identityProviderConnectionService = useIdentityProviderConnectionService();

    const [eventsRefreshKey, setEventsRefreshKey] = useState(0);

    const [scimTokens, setScimTokens] = useState<Record<IdentityProviderAccountType, string | null>>({
        requester: null,
        employee: null,
    });

    const [revokedCredentialUids, setRevokedCredentialUids] = useState<
        Record<IdentityProviderAccountType, string | null>
    >({
        requester: null,
        employee: null,
    });

    const mountedRef = useRef(false);

    const provisioningAllowed = employeeProvisioningAllowed || requesterProvisioningAllowed;

    const { busy, runAction } = useIdentityProviderAction();

    const issueScimCredential = useCallback(
        async (accountType: IdentityProviderAccountType) => {
            const credentialKey = credentialKeys[accountType];
            const credential = connection[credentialKey];
            const credentialRevoked = credential?.uid === revokedCredentialUids[accountType];

            if (credential && !credential.revoked_at && !credentialRevoked) {
                const confirmed = await confirmDangerAction(
                    translate('organizations_identity_provider_entra.provisioning.rotate'),
                    accountType === 'employee'
                        ? translate('organizations_identity_provider_entra.employee_provisioning.rotate_confirm')
                        : translate('organizations_identity_provider_entra.provisioning.rotate_confirm'),
                    translate('organizations_identity_provider_entra.provisioning.rotate'),
                    translate('organizations_identity_provider_entra.ui.cancel'),
                );

                if (!confirmed) {
                    return;
                }
            }

            if (!mountedRef.current) {
                return;
            }

            setScimTokens((values) => ({ ...values, [accountType]: null }));

            runAction(
                () =>
                    identityProviderConnectionService.issueScimCredential(organizationId, connection.uid, accountType),
                {
                    successMessage: translate('organizations_identity_provider_entra.provisioning.token_created'),
                    onSuccess: (response) => {
                        const { token, ...credential } = response.data.data;

                        setScimTokens((values) => ({ ...values, [accountType]: token }));
                        onConnectionChange({ ...connection, [credentialKey]: credential });
                        setEventsRefreshKey((value) => value + 1);
                    },
                },
            ).then();
        },
        [
            connection,
            revokedCredentialUids,
            confirmDangerAction,
            identityProviderConnectionService,
            onConnectionChange,
            organizationId,
            runAction,
            translate,
        ],
    );

    const revokeScimCredential = useCallback(
        async (accountType: IdentityProviderAccountType) => {
            const credential = connection[credentialKeys[accountType]];

            const confirmed = await confirmDangerAction(
                translate('organizations_identity_provider_entra.provisioning.revoke'),
                accountType === 'employee'
                    ? translate('organizations_identity_provider_entra.employee_provisioning.revoke_confirm')
                    : translate('organizations_identity_provider_entra.provisioning.revoke_confirm'),
                translate('organizations_identity_provider_entra.provisioning.revoke'),
                translate('organizations_identity_provider_entra.ui.cancel'),
            );

            if (!confirmed || !mountedRef.current) {
                return;
            }

            runAction(
                async () => {
                    await identityProviderConnectionService.revokeScimCredential(
                        organizationId,
                        connection.uid,
                        credential.uid,
                    );

                    if (!mountedRef.current) {
                        return;
                    }

                    setScimTokens((values) => ({ ...values, [accountType]: null }));
                    setRevokedCredentialUids((values) => ({ ...values, [accountType]: credential.uid }));
                    setEventsRefreshKey((value) => value + 1);

                    try {
                        const response = await identityProviderConnectionService.read(organizationId, connection.uid);

                        if (mountedRef.current) {
                            onConnectionChange(response.data.data);
                        }
                    } catch (error) {
                        if (mountedRef.current) {
                            pushApiError(error as ResponseError);
                        }
                    }
                },
                {
                    successMessage: translate('organizations_identity_provider_entra.provisioning.token_revoked'),
                },
            ).then();
        },
        [
            connection,
            confirmDangerAction,
            identityProviderConnectionService,
            onConnectionChange,
            organizationId,
            pushApiError,
            runAction,
            translate,
        ],
    );

    const runConnectionAction = useCallback(
        (request: () => Promise<ConnectionActionResponse>, successMessage: string) => {
            runAction(request, {
                successMessage,
                onSuccess: (response) => {
                    onConnectionChange(response.data.data.status === 'disconnected' ? null : response.data.data);
                    setEventsRefreshKey((value) => value + 1);
                },
            }).then();
        },
        [onConnectionChange, runAction],
    );

    const pauseConnection = useCallback(() => {
        confirmDangerAction(
            translate('organizations_identity_provider_entra.ui.pause_title'),
            provisioningAllowed
                ? translate('organizations_identity_provider_entra.provisioning.pause_confirm')
                : translate('organizations_identity_provider_entra.ui.pause_confirm'),
            translate('organizations_identity_provider_entra.ui.pause'),
            translate('organizations_identity_provider_entra.ui.keep_active'),
        ).then((confirmed) => {
            if (confirmed) {
                runConnectionAction(
                    () => identityProviderConnectionService.pause(organizationId, connection.uid),
                    translate('organizations_identity_provider_entra.ui.paused_message'),
                );
            }
        });
    }, [
        confirmDangerAction,
        connection.uid,
        identityProviderConnectionService,
        organizationId,
        provisioningAllowed,
        runConnectionAction,
        translate,
    ]);

    const resumeConnection = useCallback(() => {
        confirmDangerAction(
            translate('organizations_identity_provider_entra.ui.resume_title'),
            translate('organizations_identity_provider_entra.ui.resume_confirm'),
            translate('organizations_identity_provider_entra.ui.resume'),
            translate('organizations_identity_provider_entra.ui.cancel'),
        ).then((confirmed) => {
            if (confirmed) {
                runConnectionAction(
                    () => identityProviderConnectionService.resume(organizationId, connection.uid),
                    translate('organizations_identity_provider_entra.ui.resumed_message'),
                );
            }
        });
    }, [
        confirmDangerAction,
        connection.uid,
        identityProviderConnectionService,
        organizationId,
        runConnectionAction,
        translate,
    ]);

    const disconnectConnection = useCallback(() => {
        confirmDangerAction(
            translate('organizations_identity_provider_entra.ui.disconnect_title'),
            translate('organizations_identity_provider_entra.ui.disconnect_confirm'),
            translate('organizations_identity_provider_entra.ui.disconnect'),
            translate('organizations_identity_provider_entra.ui.cancel'),
        ).then((confirmed) => {
            if (confirmed) {
                runConnectionAction(
                    () => identityProviderConnectionService.disconnect(organizationId, connection.uid),
                    translate('organizations_identity_provider_entra.ui.disconnected_message'),
                );
            }
        });
    }, [
        confirmDangerAction,
        connection.uid,
        identityProviderConnectionService,
        organizationId,
        runConnectionAction,
        translate,
    ]);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    }, []);

    return (
        <>
            <EntraConnectionCard
                busy={busy}
                connection={connection}
                provisioningAllowed={provisioningAllowed}
                onPause={pauseConnection}
                onDisconnect={disconnectConnection}
                onResume={resumeConnection}
            />

            <EntraWebshopsCard organizationId={organizationId} webshops={connection.webshops} />

            <EntraEventsCard
                key={`${connection.uid}:sso`}
                category="sso"
                organizationId={organizationId}
                connectionUid={connection.uid}
                refreshKey={eventsRefreshKey}
            />

            {employeeProvisioningAllowed && (
                <>
                    <EntraProvisioningCard
                        connection={connection}
                        credential={connection.scim_credential_employee}
                        title={translate('organizations_identity_provider_entra.employee_provisioning.title')}
                        description={translate('organizations_identity_provider_entra.employee_provisioning.setup')}
                        credentialRevoked={connection.scim_credential_employee?.uid === revokedCredentialUids.employee}
                        token={scimTokens.employee}
                        busy={busy}
                        onIssue={() => issueScimCredential('employee')}
                        onRevoke={() => revokeScimCredential('employee')}
                    />

                    <EntraEventsCard
                        key={`${connection.uid}:employee_provisioning`}
                        category="employee_provisioning"
                        organizationId={organizationId}
                        connectionUid={connection.uid}
                        refreshKey={eventsRefreshKey}
                    />
                </>
            )}

            {requesterProvisioningAllowed && (
                <>
                    <EntraProvisioningCard
                        connection={connection}
                        credential={connection.scim_credential_requester}
                        title={translate('organizations_identity_provider_entra.provisioning.title')}
                        description={translate('organizations_identity_provider_entra.provisioning.setup')}
                        credentialRevoked={
                            connection.scim_credential_requester?.uid === revokedCredentialUids.requester
                        }
                        token={scimTokens.requester}
                        busy={busy}
                        onIssue={() => issueScimCredential('requester')}
                        onRevoke={() => revokeScimCredential('requester')}
                    />

                    <EntraEventsCard
                        key={`${connection.uid}:requester_provisioning`}
                        category="requester_provisioning"
                        organizationId={organizationId}
                        connectionUid={connection.uid}
                        refreshKey={eventsRefreshKey}
                    />
                </>
            )}
        </>
    );
}
