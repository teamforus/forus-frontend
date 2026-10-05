import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    appendIdentityProviderDiagnosticReference,
    consumeIdentityProviderHandoff,
} from '../../../helpers/identityProviderHandoff';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useLatestRequestWithProgress from '../../../hooks/useLatestRequestWithProgress';
import usePushApiError from '../../../hooks/usePushApiError';
import usePushDanger from '../../../hooks/usePushDanger';
import useTranslate from '../../../hooks/useTranslate';
import { useNavigateState } from '../../../modules/state_router/Router';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { ResponseError } from '../../../props/ApiResponses';
import type IdentityProviderConnection from '../../../props/models/IdentityProvider/IdentityProviderConnection';
import { useIdentityProviderConnectionService } from '../../../services/IdentityProviderConnectionService';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import EntraConnectionManagementState from './elements/states/EntraConnectionManagementState';
import EntraConnectionSetupState from './elements/states/EntraConnectionSetupState';
import EntraConnectionHistoryCard from './elements/cards/EntraConnectionHistoryCard';

export default function OrganizationIdentityProviderEntra() {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();

    const identityProviderConnectionService = useIdentityProviderConnectionService();

    const [callbackError] = useState(() => consumeIdentityProviderHandoff('entra_error'));
    const [connection, setConnection] = useState<IdentityProviderConnection | null>(undefined);
    const [callbackErrorReference] = useState(() => consumeIdentityProviderHandoff('entra_error_ref'));
    const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

    const callbackErrorHandledRef = useRef(false);

    const ssoAllowed = activeOrganization?.allow_identity_providers === 'sso';

    const runLatestRequest = useLatestRequestWithProgress();

    const fetchConnection = useCallback(() => {
        runLatestRequest((config) => identityProviderConnectionService.connection(activeOrganization.id, config), {
            onSuccess: (response) => setConnection(response.data.data),
            onError: (error) => pushApiError(error as ResponseError),
        });
    }, [activeOrganization.id, identityProviderConnectionService, pushApiError, runLatestRequest]);

    useEffect(() => {
        if (activeOrganization && !ssoAllowed) {
            navigateState(DashboardRoutes.ORGANIZATIONS);
        }
    }, [activeOrganization, navigateState, ssoAllowed]);

    useEffect(() => {
        setConnection(undefined);
    }, [activeOrganization.id]);

    useEffect(() => {
        if (ssoAllowed) {
            fetchConnection();
        }
    }, [fetchConnection, ssoAllowed]);

    useEffect(() => {
        if (!callbackError || callbackErrorHandledRef.current) {
            return;
        }

        callbackErrorHandledRef.current = true;
        pushDanger(
            translate('organizations_identity_provider_entra.ui.connection_failed'),
            appendIdentityProviderDiagnosticReference(
                translate(
                    `organizations_identity_provider_entra.errors.${callbackError}`,
                    {},
                    'organizations_identity_provider_entra.errors.unknown',
                ),
                callbackErrorReference,
            ),
        );
    }, [callbackError, callbackErrorReference, pushDanger, translate]);

    if (!ssoAllowed) {
        return null;
    }

    if (connection === undefined) {
        return <LoadingCard />;
    }

    return (
        <div>
            <div className="block block-breadcrumbs">
                <StateNavLink name={DashboardRoutes.ORGANIZATIONS} className="breadcrumb-item" activeExact={true}>
                    {activeOrganization.name}
                </StateNavLink>
                <div className="breadcrumb-item active">
                    {translate('organizations_identity_provider_entra.ui.title')}
                </div>
            </div>

            {connection ? (
                <EntraConnectionManagementState
                    connection={connection}
                    organizationId={activeOrganization.id}
                    onConnectionChange={(connection) => {
                        setConnection(connection);
                        setHistoryRefreshKey((value) => value + 1);
                    }}
                />
            ) : (
                <EntraConnectionSetupState organizationId={activeOrganization.id} />
            )}

            <EntraConnectionHistoryCard
                key={activeOrganization.id}
                organizationId={activeOrganization.id}
                refreshKey={historyRefreshKey}
            />
        </div>
    );
}
