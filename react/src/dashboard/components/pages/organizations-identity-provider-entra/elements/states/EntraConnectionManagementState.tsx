import useTranslate from '../../../../../hooks/useTranslate';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import useConfirmDangerAction from '../../../../../hooks/useConfirmDangerAction';
import useIdentityProviderAction from '../../hooks/useIdentityProviderAction';
import { ApiResponseSingle, ResponseError } from '../../../../../props/ApiResponses';
import usePushApiError from '../../../../../hooks/usePushApiError';
import type IdentityProviderConnection from '../../../../../props/models/IdentityProvider/IdentityProviderConnection';
import { useIdentityProviderConnectionService } from '../../../../../services/IdentityProviderConnectionService';
import EntraConnectionCard from '../cards/EntraConnectionCard';
import EntraEventsCard from '../cards/EntraEventsCard';
import EntraWebshopsCard from '../cards/EntraWebshopsCard';
import EntraProvisioningCard from '../cards/EntraProvisioningCard';

type ConnectionActionResponse = ApiResponseSingle<IdentityProviderConnection>;

export default function EntraConnectionManagementState({
    connection,
    onConnectionChange,
    organizationId,
    requesterProvisioningAllowed,
}: {
    connection: IdentityProviderConnection;
    onConnectionChange: (connection: IdentityProviderConnection | null) => void;
    organizationId: number;
    requesterProvisioningAllowed: boolean;
}) {
    const translate = useTranslate();
    const confirmDangerAction = useConfirmDangerAction();
    const pushApiError = usePushApiError();

    const identityProviderConnectionService = useIdentityProviderConnectionService();

    const [eventsRefreshKey, setEventsRefreshKey] = useState(0);
    const [scimToken, setScimToken] = useState<string | null>(null);
    const [revokedCredentialUid, setRevokedCredentialUid] = useState<string | null>(null);

    const credentialRevoked = !!connection.scim_credential && connection.scim_credential.uid === revokedCredentialUid;

    const mountedRef = useRef(false);

    const { busy, runAction } = useIdentityProviderAction();

    const issueScimCredential = useCallback(async () => {
        if (connection.scim_credential && !connection.scim_credential.revoked_at && !credentialRevoked) {
            const confirmed = await confirmDangerAction(
                translate('organizations_identity_provider_entra.provisioning.rotate'),
                translate('organizations_identity_provider_entra.provisioning.rotate_confirm'),
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

        setScimToken(null);

        runAction(() => identityProviderConnectionService.issueScimCredential(organizationId, connection.uid), {
            successMessage: translate('organizations_identity_provider_entra.provisioning.token_created'),
            onSuccess: (response) => {
                const { token, ...credential } = response.data.data;

                setScimToken(token);
                onConnectionChange({ ...connection, scim_credential: credential });
                setEventsRefreshKey((value) => value + 1);
            },
        }).then();
    }, [
        connection,
        credentialRevoked,
        confirmDangerAction,
        identityProviderConnectionService,
        onConnectionChange,
        organizationId,
        runAction,
        translate,
    ]);

    const revokeScimCredential = useCallback(async () => {
        const confirmed = await confirmDangerAction(
            translate('organizations_identity_provider_entra.provisioning.revoke'),
            translate('organizations_identity_provider_entra.provisioning.revoke_confirm'),
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
                    connection.scim_credential.uid,
                );

                if (!mountedRef.current) {
                    return;
                }

                setScimToken(null);
                setRevokedCredentialUid(connection.scim_credential.uid);
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
    }, [
        connection,
        confirmDangerAction,
        identityProviderConnectionService,
        onConnectionChange,
        organizationId,
        pushApiError,
        runAction,
        translate,
    ]);

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
            requesterProvisioningAllowed
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
        requesterProvisioningAllowed,
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
                requesterProvisioningAllowed={requesterProvisioningAllowed}
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

            {requesterProvisioningAllowed && (
                <>
                    <EntraProvisioningCard
                        connection={connection}
                        credentialRevoked={credentialRevoked}
                        token={scimToken}
                        busy={busy}
                        onIssue={issueScimCredential}
                        onRevoke={revokeScimCredential}
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
