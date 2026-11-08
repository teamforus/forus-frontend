import React, { useCallback, useEffect, useState } from 'react';
import { createEnumParam, NumberParam, StringParam, useQueryParam, withDefault } from 'use-query-params';
import useTranslate from '../../../hooks/useTranslate';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushApiError from '../../../hooks/usePushApiError';
import useConfirmDangerAction from '../../../hooks/useConfirmDangerAction';
import useLatestRequestWithProgress from '../../../hooks/useLatestRequestWithProgress';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { useNavigateState } from '../../../modules/state_router/Router';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import { DCPOrderCounts, useDCPOrderService } from '../../../services/DCPOrderService';
import { useDCPOrderBulkService } from '../../../services/DCPOrderBulkService';
import { PaginationData } from '../../../props/ApiResponses';
import { Permission } from '../../../props/models/Organization';
import DCPOrder from '../../../props/models/DCPOrder';
import DCPOrderBulk from '../../../props/models/DCPOrderBulk';
import { hasPermission } from '../../../helpers/utils';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import TranslateHtml from '../../elements/translate-html/TranslateHtml';
import BlockLabelTabs from '../../elements/block-label-tabs/BlockLabelTabs';
import DCPOrdersTable from './elements/DCPOrdersTable';
import { DCPOrderStateGroup, dcpOrderStateGroups } from './elements/DCPOrderState';
import DCPOrderBulksTable from './elements/DCPOrderBulksTable';

type ViewType = 'orders' | 'bulks';

export default function DCPOrders() {
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();
    const confirmDangerAction = useConfirmDangerAction();
    const runLatestRequest = useLatestRequestWithProgress();
    const runLatestRequestAwaitingApproval = useLatestRequestWithProgress();
    const runLatestRequestBulks = useLatestRequestWithProgress();

    const paginatorService = usePaginatorService();
    const dcpOrderService = useDCPOrderService();
    const dcpOrderBulkService = useDCPOrderBulkService();

    const [approving, setApproving] = useState(false);
    const [awaitingApprovalTotal, setAwaitingApprovalTotal] = useState<number>(null);
    const [paginatorKey] = useState('dcp_orders');
    const [paginatorBulksKey] = useState('dcp_order_bulks');
    const [orders, setOrders] = useState<PaginationData<DCPOrder, { counts?: DCPOrderCounts }>>(null);
    const [bulks, setBulks] = useState<PaginationData<DCPOrderBulk>>(null);

    const [viewType, setViewType] = useQueryParam(
        'view',
        withDefault(createEnumParam<ViewType>(['orders', 'bulks']), 'orders'),
        { removeDefaultsFromUrl: true },
    );

    const [viewTypes] = useState<Array<{ key: ViewType; label: string }>>([
        { key: 'orders', label: translate('dcp_orders.view_types.orders') },
        { key: 'bulks', label: translate('dcp_orders.view_types.bulks') },
    ]);

    const [stateGroups] = useState<Array<{ key: DCPOrderStateGroup | 'all'; name: string }>>([
        { key: 'all', name: translate('dcp_orders.state_groups.all') },
        ...dcpOrderStateGroups.map((key) => ({ key, name: translate(`dcp_orders.state_groups.${key}`) })),
    ]);

    const canApprove = hasPermission(activeOrganization, Permission.MANAGE_VOUCHERS);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q?: string;
        state_group?: DCPOrderStateGroup;
        page?: number;
        per_page?: number;
    }>(
        {
            q: '',
            state_group: null,
            page: 1,
            per_page: paginatorService.getPerPage(paginatorKey),
        },
        {
            queryParams: {
                q: StringParam,
                state_group: createEnumParam(dcpOrderStateGroups),
                page: NumberParam,
                per_page: NumberParam,
            },
        },
    );

    const [bulkFilterValues, bulkFilterValuesActive, bulkFilterUpdate] = useFilterNext<{
        page?: number;
        per_page?: number;
    }>(
        {
            page: 1,
            per_page: paginatorService.getPerPage(paginatorBulksKey),
        },
        {
            queryParams: {
                page: NumberParam,
                per_page: NumberParam,
            },
            queryParamsPrefix: 'bulks_',
        },
    );

    const fetchOrders = useCallback(() => {
        runLatestRequest(
            (config) => dcpOrderService.list(activeOrganization.id, { ...filterValuesActive, with_counts: 1 }, config),
            {
                onSuccess: (res) => setOrders(res.data),
                onError: pushApiError,
            },
        );
    }, [activeOrganization.id, dcpOrderService, filterValuesActive, pushApiError, runLatestRequest]);

    const fetchBulks = useCallback(() => {
        runLatestRequestBulks(
            (config) => dcpOrderBulkService.list(activeOrganization.id, bulkFilterValuesActive, config),
            {
                onSuccess: (res) => setBulks(res.data),
                onError: pushApiError,
            },
        );
    }, [activeOrganization.id, bulkFilterValuesActive, dcpOrderBulkService, pushApiError, runLatestRequestBulks]);

    const fetchAwaitingApprovalTotal = useCallback(() => {
        runLatestRequestAwaitingApproval(
            (config) => dcpOrderService.list(activeOrganization.id, { awaiting_approval: 1, per_page: 1 }, config),
            {
                onSuccess: (res) => setAwaitingApprovalTotal(res.data.meta.total),
                onError: pushApiError,
            },
        );
    }, [activeOrganization.id, dcpOrderService, pushApiError, runLatestRequestAwaitingApproval]);

    const approveBulk = useCallback(() => {
        confirmDangerAction(
            translate('dcp_orders.confirm_approve.title'),
            translate('dcp_orders.confirm_approve.description', { count: awaitingApprovalTotal }),
            translate('dcp_orders.confirm_approve.confirm'),
            translate('dcp_orders.confirm_approve.cancel'),
        ).then((confirmed) => {
            if (!confirmed) {
                return;
            }

            setApproving(true);

            dcpOrderBulkService
                .store(activeOrganization.id)
                .then((res) => {
                    pushSuccess(
                        translate('dcp_orders.notifications.approved', {
                            count: res.data.data.dcp_orders_count,
                        }),
                    );

                    navigateState(DashboardRoutes.DCP_ORDER_BULK, {
                        organizationId: activeOrganization.id,
                        id: res.data.data.id,
                    });
                })
                .catch((err) => {
                    pushApiError(err);
                    fetchOrders();
                    fetchAwaitingApprovalTotal();
                })
                .finally(() => setApproving(false));
        });
    }, [
        activeOrganization.id,
        awaitingApprovalTotal,
        confirmDangerAction,
        dcpOrderBulkService,
        fetchAwaitingApprovalTotal,
        fetchOrders,
        navigateState,
        pushApiError,
        pushSuccess,
        translate,
    ]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        fetchBulks();
    }, [fetchBulks]);

    useEffect(() => {
        fetchAwaitingApprovalTotal();
    }, [fetchAwaitingApprovalTotal]);

    useEffect(() => {
        if (
            !activeOrganization.allow_physical_cards ||
            !hasPermission(activeOrganization, [Permission.MANAGE_VOUCHERS, Permission.VIEW_VOUCHERS])
        ) {
            navigateState(DashboardRoutes.ORGANIZATIONS);
        }
    }, [activeOrganization, navigateState]);

    if (!orders || !bulks) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {viewType === 'orders'
                        ? `${translate('dcp_orders.header.title')} (${orders.meta.total})`
                        : `${translate('dcp_orders.header.title_bulks')} (${bulks.meta.total})`}
                </div>

                <div className="card-header-filters">
                    <div className="block block-inline-filters form">
                        {viewType === 'orders' && (
                            <BlockLabelTabs
                                value={filterValues.state_group || 'all'}
                                setValue={(key: DCPOrderStateGroup | 'all') =>
                                    filterUpdate({ state_group: key === 'all' ? null : key, page: 1 })
                                }
                                tabs={stateGroups.map((group) => ({
                                    value: group.key,
                                    label: `${group.name} (${orders.meta.counts?.[group.key] ?? 0})`,
                                }))}
                            />
                        )}

                        <div className="flex">
                            <BlockLabelTabs
                                value={viewType}
                                setValue={(key: ViewType) => setViewType(key)}
                                tabs={viewTypes.map((type) => ({
                                    value: type.key,
                                    label: type.label,
                                }))}
                            />
                        </div>

                        {viewType === 'orders' && (
                            <div className="form">
                                <div className="form-group">
                                    <input
                                        className="form-control"
                                        type="text"
                                        placeholder={translate('dcp_orders.labels.search')}
                                        value={filter.values.q}
                                        onChange={(e) => filter.update({ q: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {viewType === 'orders' && (
                <DCPOrdersTable
                    organization={activeOrganization}
                    orders={orders}
                    paginatorKey={paginatorKey}
                    filter={filter}
                    filterValues={filterValues}
                    filterUpdate={filterUpdate}
                    onChange={() => {
                        fetchOrders();
                        fetchBulks();
                        fetchAwaitingApprovalTotal();
                    }}
                />
            )}

            {viewType === 'bulks' && (
                <DCPOrderBulksTable
                    organization={activeOrganization}
                    bulks={bulks}
                    paginatorKey={paginatorBulksKey}
                    filterValues={bulkFilterValues}
                    filterUpdate={bulkFilterUpdate}
                />
            )}

            {awaitingApprovalTotal > 0 && canApprove && (
                <div className="card-section">
                    <div className="flex flex-vertical">
                        <div className="card-text">
                            <TranslateHtml
                                i18n={'dcp_orders.labels.awaiting_approval'}
                                values={{ count: awaitingApprovalTotal }}
                            />
                        </div>
                        <button className="button button-primary" onClick={approveBulk} disabled={approving}>
                            {approving ? (
                                <em className="mdi mdi-spin mdi-loading icon-start" />
                            ) : (
                                <em className="mdi mdi-cube-send icon-start" />
                            )}
                            {translate('dcp_orders.buttons.approve_bulk')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
