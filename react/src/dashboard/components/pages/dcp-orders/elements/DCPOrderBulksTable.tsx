import React from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import { PaginationData } from '../../../../props/ApiResponses';
import Organization from '../../../../props/models/Organization';
import DCPOrderBulk from '../../../../props/models/DCPOrderBulk';
import { FilterModel, FilterSetter } from '../../../../modules/filter_next/types/FilterParams';
import { useDCPOrderBulkService } from '../../../../services/DCPOrderBulkService';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import Label, { LabelType } from '../../../elements/label/Label';

export const dcpOrderBulkStateLabelTypes: { [key in DCPOrderBulk['state']]: LabelType } = {
    pending: 'primary-light',
    sent: 'success',
    error: 'danger',
};

export default function DCPOrderBulksTable({
    organization,
    bulks,
    paginatorKey,
    filterValues,
    filterUpdate,
}: {
    organization: Organization;
    bulks: PaginationData<DCPOrderBulk>;
    paginatorKey: string;
    filterValues: FilterModel;
    filterUpdate: FilterSetter;
}) {
    const translate = useTranslate();
    const dcpOrderBulkService = useDCPOrderBulkService();

    return (
        <LoaderTableCard
            empty={bulks.meta.total == 0}
            emptyTitle={translate('dcp_order_bulks.empty.title')}
            emptyDescription={translate('dcp_order_bulks.empty.description')}
            columns={dcpOrderBulkService.getColumns()}
            paginator={{ key: paginatorKey, data: bulks, filterValues, filterUpdate }}>
            {bulks.data.map((bulk) => (
                <StateNavLink
                    customElement={'tr'}
                    className={'tr-clickable'}
                    name={DashboardRoutes.DCP_ORDER_BULK}
                    params={{ organizationId: organization.id, id: bulk.id }}
                    key={bulk.id}>
                    <td className="td-narrow nowrap">{bulk.id}</td>
                    <td>
                        <div className="text-semibold text-primary">{bulk.created_at_locale.split(' - ')[0]}</div>
                        <div className="text-strong text-md text-muted-dark">
                            {bulk.created_at_locale.split(' - ')[1]}
                        </div>
                    </td>
                    <td>{bulk.employee_email || <TableEmptyValue />}</td>
                    <td>{bulk.dcp_orders_count}</td>
                    <td>{bulk.dcp_orders_sent_count}</td>
                    <td>{bulk.dcp_orders_error_count}</td>
                    <td>
                        <Label type={dcpOrderBulkStateLabelTypes[bulk.state]} nowrap={true}>
                            {bulk.state_locale}
                        </Label>
                    </td>
                    <td className="td-narrow"></td>
                </StateNavLink>
            ))}
        </LoaderTableCard>
    );
}
