import useTranslate from '../../../hooks/useTranslate';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useLatestRequestWithProgress from '../../../hooks/useLatestRequestWithProgress';
import usePushApiError from '../../../hooks/usePushApiError';
import { useNavigateState } from '../../../modules/state_router/Router';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { ResponseError } from '../../../props/ApiResponses';
import type IdentityProviderConnection from '../../../props/models/IdentityProvider/IdentityProviderConnection';
import { useIdentityProviderConnectionService } from '../../../services/IdentityProviderConnectionService';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import EntraConnectionCard from './elements/cards/EntraConnectionCard';
import EntraEventsCard from './elements/cards/EntraEventsCard';

export default function OrganizationIdentityProviderConnection() {
    const translate = useTranslate();
    const { connectionUid } = useParams<{ connectionUid: string }>();
    const organization = useActiveOrganization();
    const navigateState = useNavigateState();
    const pushApiError = usePushApiError();

    const identityProviderConnectionService = useIdentityProviderConnectionService();

    const [connection, setConnection] = useState<IdentityProviderConnection>(null);

    const runLatestRequest = useLatestRequestWithProgress();

    const fetchConnection = useCallback(() => {
        runLatestRequest((config) => identityProviderConnectionService.read(organization.id, connectionUid, config), {
            onSuccess: (response) => setConnection(response.data.data),
            onError: (error) => {
                pushApiError(error as ResponseError);
                navigateState(DashboardRoutes.ORGANIZATION_IDENTITY_PROVIDERS, { organizationId: organization.id });
            },
        });
    }, [
        connectionUid,
        identityProviderConnectionService,
        navigateState,
        organization.id,
        pushApiError,
        runLatestRequest,
    ]);

    useEffect(() => {
        setConnection(null);
        fetchConnection();
    }, [fetchConnection]);

    if (!connection) {
        return <LoadingCard />;
    }

    return (
        <div>
            <div className="block block-breadcrumbs">
                <StateNavLink name={DashboardRoutes.ORGANIZATIONS} className="breadcrumb-item" activeExact={true}>
                    {organization.name}
                </StateNavLink>
                <StateNavLink
                    name={DashboardRoutes.ORGANIZATION_IDENTITY_PROVIDERS}
                    params={{ organizationId: organization.id }}
                    className="breadcrumb-item"
                    activeExact={true}>
                    {translate('organizations_identity_provider_entra.ui.title')}
                </StateNavLink>
                <div className="breadcrumb-item active">
                    {translate('organizations_identity_provider_entra.ui.connection_details')}
                </div>
            </div>

            <EntraConnectionCard connection={connection} readOnly={true} />

            <EntraEventsCard
                key={connection.uid}
                organizationId={organization.id}
                connectionUid={connection.uid}
                refreshKey={0}
            />
        </div>
    );
}
