import React, { ReactNode, useEffect, useState } from 'react';
import { NumberParam, StringParam } from 'use-query-params';
import useTranslate from '../../../../hooks/useTranslate';
import usePushApiError from '../../../../hooks/usePushApiError';
import useLatestRequestWithProgress from '../../../../hooks/useLatestRequestWithProgress';
import { useDCPService } from '../../../../services/DCPService';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import { PaginationData } from '../../../../props/ApiResponses';
import DCPOrderBulk from '../../../../props/models/DCPOrderBulk';
import Card from '../../../elements/card/Card';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TableRowActions from '../../../elements/tables/TableRowActions';
import TableRowActionItem from '../../../elements/tables/TableRowActionItem';
import CardHeaderFilterNext from '../../../elements/tables/elements/CardHeaderFilterNext';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function DCPBulksCard({ organizationId, tabs }: { organizationId: number; tabs: ReactNode }) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const runLatestRequest = useLatestRequestWithProgress();

    const service = useDCPService();
    const paginatorService = usePaginatorService();

    const [loading, setLoading] = useState(true);
    const [paginatorKey] = useState('dcp_order_bulks');
    const [rows, setRows] = useState<PaginationData<DCPOrderBulk>>(null);

    const [filterValues, activeFilters, filterUpdate, filter] = useFilterNext(
        { q: '', page: 1, per_page: paginatorService.getPerPage(paginatorKey, 10) },
        { queryParams: { q: StringParam, page: NumberParam, per_page: NumberParam } },
    );

    useEffect(() => {
        runLatestRequest((config) => service.bulks(organizationId, activeFilters, config), {
            onStart: () => setLoading(true),
            onSuccess: (response) => setRows(response.data),
            onError: pushApiError,
            onFinally: () => setLoading(false),
        });
    }, [activeFilters, organizationId, pushApiError, runLatestRequest, service]);

    return (
        <Card
            title={translate('dcp.bulks') + (rows ? ` (${rows.meta.total})` : '')}
            section={false}
            className="form"
            filters={
                <div className="card-header-filters">
                    <div className="block block-inline-filters">{tabs}</div>

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
                    </CardHeaderFilterNext>
                </div>
            }>
            <LoaderTableCard
                loading={loading}
                empty={!rows?.data.length}
                emptyTitle={translate('dcp.empty_bulks')}
                columns={['id', 'approved_at', 'employee', 'total', 'submitted', 'shipped'].map((key) => ({
                    key,
                    label: `dcp.fields.${key}`,
                    tooltip: { key, title: `dcp.fields.${key}`, description: `dcp.tooltips.${key}` },
                }))}
                paginator={{ key: paginatorKey, data: rows, filterValues, filterUpdate }}>
                {rows?.data.map((bulk) => (
                    <StateNavLink
                        key={bulk.id}
                        customElement="tr"
                        className="tr-clickable"
                        name={DashboardRoutes.DCP_ORDER_BULK}
                        params={{ organizationId, id: bulk.id }}>
                        <td>{bulk.id}</td>
                        <td>{bulk.approved_at_locale}</td>
                        <td>{bulk.employee_email || <TableEmptyValue />}</td>
                        <td>{bulk.dcp_orders_count}</td>
                        <td>{bulk.submitted_count}</td>
                        <td>{bulk.shipped_count}</td>
                        <td className="table-td-actions text-right">
                            <TableRowActions
                                content={() => (
                                    <div className="dropdown dropdown-actions">
                                        <TableRowActionItem
                                            type="link"
                                            icon="mdi-eye"
                                            name={DashboardRoutes.DCP_ORDER_BULK}
                                            params={{ organizationId, id: bulk.id }}>
                                            {translate('dcp.view')}
                                        </TableRowActionItem>
                                    </div>
                                )}
                            />
                        </td>
                    </StateNavLink>
                ))}
            </LoaderTableCard>
        </Card>
    );
}
