import React, { ReactNode, useEffect, useState } from 'react';
import { NumberParam, StringParam } from 'use-query-params';
import useTranslate from '../../../../hooks/useTranslate';
import usePushApiError from '../../../../hooks/usePushApiError';
import useLatestRequestWithProgress from '../../../../hooks/useLatestRequestWithProgress';
import { DCPOrderFilters, useDCPService } from '../../../../services/DCPService';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import DCPOrder, { DCPOrderListMeta, DCPOrderState, DCPOrderStateGroup } from '../../../../props/models/DCPOrder';
import { PaginationData } from '../../../../props/ApiResponses';
import Card from '../../../elements/card/Card';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import BlockLabelTabs from '../../../elements/block-label-tabs/BlockLabelTabs';
import CardHeaderFilterNext from '../../../elements/tables/elements/CardHeaderFilterNext';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../../elements/select-control/SelectControl';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TableRowActions from '../../../elements/tables/TableRowActions';
import TableRowActionItem from '../../../elements/tables/TableRowActionItem';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import DCPOrderStateLabel from './DCPOrderStateLabel';
import DCPBulkApproval from './DCPBulkApproval';

export default function DCPOrdersCard({
    organizationId,
    bulkId,
    tabs,
}: {
    organizationId: number;
    bulkId?: number;
    tabs?: ReactNode;
}) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const runLatestRequest = useLatestRequestWithProgress();

    const service = useDCPService();
    const paginatorService = usePaginatorService();

    const [loading, setLoading] = useState(true);
    const [paginatorKey] = useState('dcp_orders');
    const [rows, setRows] = useState<PaginationData<DCPOrder, DCPOrderListMeta>>(null);

    const [filterValues, activeFilters, filterUpdate, filter] = useFilterNext<DCPOrderFilters>(
        { q: '', state: '', state_group: '', page: 1, per_page: paginatorService.getPerPage(paginatorKey, 10) },
        {
            queryParams: {
                q: StringParam,
                state: StringParam,
                state_group: StringParam,
                page: NumberParam,
                per_page: NumberParam,
            },
        },
    );

    useEffect(() => {
        runLatestRequest(
            (config) => service.orders(organizationId, { ...activeFilters, dcp_order_bulk_id: bulkId }, config),
            {
                onStart: () => setLoading(true),
                onSuccess: (response) => setRows(response.data),
                onError: pushApiError,
                onFinally: () => setLoading(false),
            },
        );
    }, [activeFilters, bulkId, organizationId, pushApiError, runLatestRequest, service]);

    return (
        <Card
            title={translate('dcp.orders') + (rows ? ` (${rows.meta.total})` : '')}
            section={false}
            className="form"
            filters={
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <BlockLabelTabs<DCPOrderStateGroup | ''>
                            value={filterValues.state_group}
                            setValue={(state_group) => filterUpdate({ state_group, state: '', page: 1 })}
                            tabs={(['', 'draft', 'in_progress', 'needs_attention', 'completed'] as const).map(
                                (value) => ({
                                    value,
                                    label:
                                        translate(`dcp.groups.${value || 'all'}`) +
                                        ` (${rows?.meta.counts[value || 'all'] ?? 0})`,
                                }),
                            )}
                        />

                        {tabs}
                    </div>

                    <CardHeaderFilterNext
                        filter={{ ...filter, update: (values) => filterUpdate({ ...values, page: 1 }) }}>
                        <FilterItemToggle show={true} label={translate('dcp.search')}>
                            <input
                                className="form-control"
                                value={filterValues.q}
                                placeholder={translate('dcp.search')}
                                onChange={(event) => filterUpdate({ q: event.target.value, page: 1 })}
                            />
                        </FilterItemToggle>

                        <FilterItemToggle show={true} label={translate('dcp.fields.state')}>
                            <SelectControl
                                propKey="value"
                                value={filterValues.state}
                                options={[
                                    '',
                                    'draft',
                                    'approved',
                                    'sending',
                                    'accepted',
                                    'rejected',
                                    'unknown',
                                    'closed',
                                    'canceled',
                                    'blocked',
                                ].map((value) => ({
                                    value,
                                    name: translate(value ? `dcp.states.${value}` : 'dcp.groups.all'),
                                }))}
                                onChange={(state: DCPOrderState | '') =>
                                    filterUpdate({ state, state_group: '', page: 1 })
                                }
                            />
                        </FilterItemToggle>
                    </CardHeaderFilterNext>
                </div>
            }>
            <LoaderTableCard
                loading={loading}
                empty={!rows?.data.length}
                emptyTitle={translate('dcp.empty_orders')}
                columns={['id', 'recipient', 'pass_code', 'bulk', 'created_at', 'state'].map((key) => ({
                    key,
                    label: `dcp.fields.${key}`,
                    tooltip: { key, title: `dcp.fields.${key}`, description: `dcp.tooltips.${key}` },
                }))}
                paginator={{ key: paginatorKey, data: rows, filterValues, filterUpdate }}>
                {rows?.data.map((order) => (
                    <StateNavLink
                        customElement="tr"
                        className="tr-clickable"
                        key={order.id}
                        name={DashboardRoutes.DCP_ORDER}
                        params={{ organizationId, id: order.id }}>
                        <td>{order.id}</td>
                        <td>
                            {order.delivery_address.first_name} {order.delivery_address.last_name}
                        </td>
                        <td>{order.source?.code || <TableEmptyValue />}</td>
                        <td>{order.dcp_order_bulk_id || <TableEmptyValue />}</td>
                        <td>{order.created_at_locale}</td>
                        <td>
                            <DCPOrderStateLabel order={order} />
                        </td>
                        <td className="table-td-actions text-right">
                            <TableRowActions
                                content={() => (
                                    <div className="dropdown dropdown-actions">
                                        <TableRowActionItem
                                            type="link"
                                            icon="mdi-eye"
                                            name={DashboardRoutes.DCP_ORDER}
                                            params={{ organizationId, id: order.id }}>
                                            {translate('dcp.view')}
                                        </TableRowActionItem>
                                    </div>
                                )}
                            />
                        </td>
                    </StateNavLink>
                ))}
            </LoaderTableCard>

            {!bulkId && rows?.meta.can_approve && <DCPBulkApproval organizationId={organizationId} />}
        </Card>
    );
}
