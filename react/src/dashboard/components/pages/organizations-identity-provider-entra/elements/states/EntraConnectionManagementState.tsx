import useTranslate from '../../../../../hooks/useTranslate';
import React, { useCallback, useState } from 'react';
import useConfirmDangerAction from '../../../../../hooks/useConfirmDangerAction';
import useIdentityProviderAction from '../../hooks/useIdentityProviderAction';
import { ApiResponseSingle } from '../../../../../props/ApiResponses';
import type IdentityProviderConnection from '../../../../../props/models/IdentityProvider/IdentityProviderConnection';
import { useIdentityProviderConnectionService } from '../../../../../services/IdentityProviderConnectionService';
import EntraConnectionCard from '../cards/EntraConnectionCard';
import EntraEventsCard from '../cards/EntraEventsCard';
import EntraWebshopsCard from '../cards/EntraWebshopsCard';

type ConnectionActionResponse = ApiResponseSingle<IdentityProviderConnection>;

export default function EntraConnectionManagementState({
    connection,
    onConnectionChange,
    organizationId,
}: {
    connection: IdentityProviderConnection;
    onConnectionChange: (connection: IdentityProviderConnection | null) => void;
    organizationId: number;
}) {
    const translate = useTranslate();
    const confirmDangerAction = useConfirmDangerAction();

    const identityProviderConnectionService = useIdentityProviderConnectionService();

    const [eventsRefreshKey, setEventsRefreshKey] = useState(0);

    const { busy, runAction } = useIdentityProviderAction();

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
            translate('organizations_identity_provider_entra.ui.pause_confirm'),
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

    return (
        <>
            <EntraConnectionCard
                busy={busy}
                connection={connection}
                onPause={pauseConnection}
                onDisconnect={disconnectConnection}
                onResume={() =>
                    runConnectionAction(
                        () => identityProviderConnectionService.resume(organizationId, connection.uid),
                        translate('organizations_identity_provider_entra.ui.resumed_message'),
                    )
                }
            />

            <EntraWebshopsCard organizationId={organizationId} webshops={connection.webshops} />

            <EntraEventsCard
                key={connection.uid}
                organizationId={organizationId}
                connectionUid={connection.uid}
                refreshKey={eventsRefreshKey}
            />
        </>
    );
}
