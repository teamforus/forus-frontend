import React, { useCallback } from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalDCPOrderIdDcp from '../../../modals/ModalDCPOrderIdDcp';
import useTranslate from '../../../../hooks/useTranslate';
import { hasPermission } from '../../../../helpers/utils';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import { PaginationData } from '../../../../props/ApiResponses';
import Organization, { Permission } from '../../../../props/models/Organization';
import DCPOrder from '../../../../props/models/DCPOrder';
import { FilterModel, FilterScope, FilterSetter } from '../../../../modules/filter_next/types/FilterParams';
import { useDCPOrderService } from '../../../../services/DCPOrderService';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TableRowActions from '../../../elements/tables/TableRowActions';
import DCPOrderState from './DCPOrderState';
import useRetryDCPOrder from '../hooks/useRetryDCPOrder';

export default function DCPOrdersTable({
    organization,
    orders,
    paginatorKey,
    filter,
    filterValues,
    filterUpdate,
    showBulk = true,
    onChange,
}: {
    organization: Organization;
    orders: PaginationData<DCPOrder>;
    paginatorKey: string;
    filter?: FilterScope<FilterModel>;
    filterValues: FilterModel;
    filterUpdate: FilterSetter;
    showBulk?: boolean;
    onChange?: () => void;
}) {
    const translate = useTranslate();
    const dcpOrderService = useDCPOrderService();

    const canRetry = hasPermission(organization, Permission.MANAGE_VOUCHERS);
    const { retry, retrying } = useRetryDCPOrder(organization, onChange);

    const openModal = useOpenModal();

    const setOrderIdDcp = useCallback(
        (order: DCPOrder) => {
            openModal((modal) => (
                <ModalDCPOrderIdDcp
                    modal={modal}
                    order={order}
                    organization={organization}
                    onUpdated={() => onChange?.()}
                />
            ));
        },
        [onChange, openModal, organization],
    );

    return (
        <LoaderTableCard
            empty={orders.meta.total == 0}
            emptyTitle={translate('dcp_orders.empty.title')}
            emptyDescription={translate('dcp_orders.empty.description')}
            columns={dcpOrderService.getColumns()}
            tableOptions={filter ? { filter } : undefined}
            paginator={{ key: paginatorKey, data: orders, filterValues, filterUpdate }}>
            {orders.data.map((order) => (
                <StateNavLink
                    customElement={'tr'}
                    className={'tr-clickable'}
                    name={DashboardRoutes.DCP_ORDER}
                    params={{ organizationId: organization.id, id: order.id }}
                    key={order.id}>
                    <td className="td-narrow nowrap">{order.id}</td>
                    <td>{order.delivery_address.fullname || <TableEmptyValue />}</td>
                    <td>
                        <div>{order.delivery_address.address1}</div>
                        <div className="text-muted">
                            {[order.delivery_address.zipcode, order.delivery_address.city]
                                .filter((value) => value)
                                .join(' ')}
                        </div>
                    </td>
                    <td>
                        {order.orderable ? (
                            <div className="flex flex-vertical">
                                <div>{order.orderable.name}</div>
                                {order.orderable.voucher_id && (
                                    <div className="text-muted">
                                        {translate('dcp_orders.labels.voucher', {
                                            number: order.orderable.voucher_number,
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <TableEmptyValue />
                        )}
                    </td>
                    <td className="nowrap">{order.created_at_locale}</td>
                    <td>{order.order_id_dcp || <TableEmptyValue />}</td>
                    <td>
                        <div className="flex flex-vertical flex-gap-xs">
                            <DCPOrderState order={order} />
                            {showBulk && order.dcp_order_bulk_id && (
                                <div className="text-muted">
                                    {translate('dcp_orders.labels.bulk', { id: order.dcp_order_bulk_id })}
                                </div>
                            )}
                        </div>
                    </td>
                    <td className="nowrap">{order.shipped_at_locale || <TableEmptyValue />}</td>
                    <td className={'table-td-actions text-right'}>
                        <TableRowActions
                            disabled={retrying === order.id}
                            content={({ close }) => (
                                <div className="dropdown dropdown-actions">
                                    <StateNavLink
                                        name={DashboardRoutes.DCP_ORDER}
                                        params={{ organizationId: organization.id, id: order.id }}
                                        className="dropdown-item">
                                        <em className="mdi mdi-eye-outline icon-start" />
                                        {translate('dcp_orders.buttons.view')}
                                    </StateNavLink>

                                    {order.orderable?.voucher_id && (
                                        <StateNavLink
                                            name={DashboardRoutes.VOUCHER}
                                            params={{ organizationId: organization.id, id: order.orderable.voucher_id }}
                                            className="dropdown-item">
                                            <em className="mdi mdi-eye-outline icon-start" />
                                            {translate('dcp_orders.buttons.view_voucher')}
                                        </StateNavLink>
                                    )}

                                    {showBulk && order.dcp_order_bulk_id && (
                                        <StateNavLink
                                            name={DashboardRoutes.DCP_ORDER_BULK}
                                            params={{ organizationId: organization.id, id: order.dcp_order_bulk_id }}
                                            className="dropdown-item">
                                            <em className="mdi mdi-eye-outline icon-start" />
                                            {translate('dcp_orders.buttons.view_bulk')}
                                        </StateNavLink>
                                    )}

                                    {canRetry && order.is_duplicate && (
                                        <div
                                            className="dropdown-item"
                                            onClick={() => {
                                                close();
                                                setOrderIdDcp(order);
                                            }}>
                                            <em className="mdi mdi-pencil-outline icon-start" />
                                            {translate('dcp_orders.buttons.set_order_id_dcp')}
                                        </div>
                                    )}

                                    {canRetry && order.state === 'error' && (
                                        <div
                                            className="dropdown-item"
                                            onClick={() => {
                                                close();
                                                retry(order);
                                            }}>
                                            <em className="mdi mdi-refresh icon-start" />
                                            {translate('dcp_orders.buttons.retry')}
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                    </td>
                </StateNavLink>
            ))}
        </LoaderTableCard>
    );
}
