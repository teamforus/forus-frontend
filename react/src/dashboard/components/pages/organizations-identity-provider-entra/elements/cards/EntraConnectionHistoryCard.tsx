import useTranslate from '../../../../../hooks/useTranslate';
import React, { useCallback, useEffect, useState } from 'react';
import useLatestRequestWithProgress from '../../../../../hooks/useLatestRequestWithProgress';
import usePushApiError from '../../../../../hooks/usePushApiError';
import useFilterNext from '../../../../../modules/filter_next/useFilterNext';
import usePaginatorService from '../../../../../modules/paginator/services/usePaginatorService';
import { DashboardRoutes } from '../../../../../modules/state_router/RouterBuilder';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import { PaginationData, ResponseError } from '../../../../../props/ApiResponses';
import type IdentityProviderConnectionHistory from '../../../../../props/models/IdentityProvider/IdentityProviderConnectionHistory';
import { useIdentityProviderConnectionService } from '../../../../../services/IdentityProviderConnectionService';
import LoaderTableCard from '../../../../elements/loader-table-card/LoaderTableCard';
import TableEmptyValue from '../../../../elements/table-empty-value/TableEmptyValue';
import TableRowActions from '../../../../elements/tables/TableRowActions';

export default function EntraConnectionHistoryCard({
    organizationId,
    refreshKey,
}: {
    organizationId: number;
    refreshKey: number;
}) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();

    const paginatorService = usePaginatorService();
    const identityProviderConnectionService = useIdentityProviderConnectionService();

    const [paginatorKey] = useState('identity_provider_connections_previous');
    const [connections, setConnections] = useState<PaginationData<IdentityProviderConnectionHistory>>(null);

    const runLatestRequest = useLatestRequestWithProgress();

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext({
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const fetchHistory = useCallback(() => {
        runLatestRequest(
            (config) => identityProviderConnectionService.history(organizationId, filterValuesActive, config),
            {
                onSuccess: (response) => setConnections(response.data),
                onError: (error) => pushApiError(error as ResponseError),
            },
        );
    }, [filterValuesActive, identityProviderConnectionService, organizationId, pushApiError, runLatestRequest]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory, refreshKey]);

    if (connections?.meta.total === 0) {
        return null;
    }

    return (
        <div className="card card-collapsed">
            <div className="card-header">
                <div className="card-title">{translate('organizations_identity_provider_entra.ui.history_title')}</div>
            </div>

            <LoaderTableCard
                loading={!connections}
                columns={identityProviderConnectionService.getHistoryColumns()}
                tableOptions={{ hasTooltips: false }}
                paginator={{ key: paginatorKey, data: connections, filterValues, filterUpdate }}>
                {connections?.data.map((connection) => (
                    <StateNavLink
                        key={connection.uid}
                        name={DashboardRoutes.ORGANIZATION_IDENTITY_PROVIDER_CONNECTION}
                        params={{ organizationId, connectionUid: connection.uid }}
                        customElement="tr"
                        className="tr-clickable">
                        <td>{connection.tenant_id}</td>
                        <td>{connection.consented_at_locale || <TableEmptyValue />}</td>
                        <td>{connection.disconnected_at_locale || <TableEmptyValue />}</td>
                        <td className="table-td-actions text-right">
                            <TableRowActions
                                content={(e) => (
                                    <div className="dropdown dropdown-actions">
                                        <StateNavLink
                                            name={DashboardRoutes.ORGANIZATION_IDENTITY_PROVIDER_CONNECTION}
                                            params={{ organizationId, connectionUid: connection.uid }}
                                            className="dropdown-item"
                                            onClick={e.close}>
                                            <em className="mdi mdi-eye icon-start" />{' '}
                                            {translate('organizations_identity_provider_entra.ui.view_details')}
                                        </StateNavLink>
                                    </div>
                                )}
                            />
                        </td>
                    </StateNavLink>
                ))}
            </LoaderTableCard>
        </div>
    );
}
