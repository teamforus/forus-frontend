import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { NumberParam } from 'use-query-params';
import useTranslate from '../../../hooks/useTranslate';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import usePushApiError from '../../../hooks/usePushApiError';
import useSetProgress from '../../../hooks/useSetProgress';
import useLatestRequestWithProgress from '../../../hooks/useLatestRequestWithProgress';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import { useDCPOrderBulkService } from '../../../services/DCPOrderBulkService';
import { useDCPOrderService } from '../../../services/DCPOrderService';
import { PaginationData } from '../../../props/ApiResponses';
import DCPOrderBulk from '../../../props/models/DCPOrderBulk';
import DCPOrder from '../../../props/models/DCPOrder';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import KeyValueItem from '../../elements/key-value/KeyValueItem';
import Label from '../../elements/label/Label';
import DCPOrdersTable from '../dcp-orders/elements/DCPOrdersTable';
import { dcpOrderBulkStateLabelTypes } from '../dcp-orders/elements/DCPOrderBulksTable';

export default function DCPOrderBulksView() {
    const bulkId = parseInt(useParams().id);

    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();
    const runLatestRequest = useLatestRequestWithProgress();

    const paginatorService = usePaginatorService();
    const dcpOrderBulkService = useDCPOrderBulkService();
    const dcpOrderService = useDCPOrderService();

    const [bulk, setBulk] = useState<DCPOrderBulk>(null);
    const [paginatorKey] = useState('dcp_order_bulk_orders');
    const [orders, setOrders] = useState<PaginationData<DCPOrder>>(null);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        page?: number;
        per_page?: number;
    }>(
        {
            page: 1,
            per_page: paginatorService.getPerPage(paginatorKey),
        },
        {
            queryParams: {
                page: NumberParam,
                per_page: NumberParam,
            },
        },
    );

    const fetchBulk = useCallback(() => {
        setProgress(0);

        dcpOrderBulkService
            .show(activeOrganization.id, bulkId)
            .then((res) => setBulk(res.data.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [activeOrganization.id, bulkId, dcpOrderBulkService, pushApiError, setProgress]);

    const fetchOrders = useCallback(() => {
        runLatestRequest(
            (config) =>
                dcpOrderService.list(
                    activeOrganization.id,
                    { ...filterValuesActive, dcp_order_bulk_id: bulkId },
                    config,
                ),
            {
                onSuccess: (res) => setOrders(res.data),
                onError: pushApiError,
            },
        );
    }, [activeOrganization.id, bulkId, filterValuesActive, dcpOrderService, pushApiError, runLatestRequest]);

    useEffect(() => {
        fetchBulk();
    }, [fetchBulk]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    if (!bulk || !orders) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={DashboardRoutes.DCP_ORDERS}
                    params={{ organizationId: activeOrganization.id }}
                    query={{ view: 'bulks' }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {translate('dcp_orders.header.title')}
                </StateNavLink>
                <div className="breadcrumb-item active">{`#${bulk.id}`}</div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex flex-grow card-title flex-align-items-center flex-gap">
                        <span>{translate('dcp_order_bulks.header.title', { id: bulk.id })}</span>
                        <Label type={dcpOrderBulkStateLabelTypes[bulk.state]}>{bulk.state_locale}</Label>
                    </div>
                    <div className="card-header-filters">
                        <div className="block block-inline-filters">
                            <button
                                type="button"
                                className="button button-default button-sm"
                                onClick={() => {
                                    fetchBulk();
                                    fetchOrders();
                                }}>
                                <em className="mdi mdi-reload icon-start" />
                                {translate('dcp_order_bulks.buttons.refresh')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card-section">
                    <div className="card-block card-block-keyvalue">
                        <KeyValueItem label={translate('dcp_order_bulks.labels.id')}>{bulk.id}</KeyValueItem>
                        <KeyValueItem label={translate('dcp_order_bulks.labels.created_at')}>
                            {bulk.created_at_locale}
                        </KeyValueItem>
                        <KeyValueItem label={translate('dcp_order_bulks.labels.employee')}>
                            {bulk.employee_email}
                        </KeyValueItem>
                        <KeyValueItem label={translate('dcp_order_bulks.labels.orders_count')}>
                            {bulk.dcp_orders_count}
                        </KeyValueItem>
                        <KeyValueItem label={translate('dcp_order_bulks.labels.orders_pending')}>
                            {bulk.dcp_orders_pending_count}
                        </KeyValueItem>
                        <KeyValueItem label={translate('dcp_order_bulks.labels.orders_sent')}>
                            {bulk.dcp_orders_sent_count}
                        </KeyValueItem>
                        <KeyValueItem label={translate('dcp_order_bulks.labels.orders_error')}>
                            {bulk.dcp_orders_error_count}
                        </KeyValueItem>
                        <KeyValueItem label={translate('dcp_order_bulks.labels.processed_at')}>
                            {bulk.processed_at_locale}
                        </KeyValueItem>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">
                        {translate('dcp_order_bulks.header.orders')} ({orders.meta.total})
                    </div>
                </div>

                <DCPOrdersTable
                    organization={activeOrganization}
                    orders={orders}
                    paginatorKey={paginatorKey}
                    filterValues={filterValues}
                    filterUpdate={filterUpdate}
                    showBulk={false}
                    onChange={() => {
                        fetchBulk();
                        fetchOrders();
                    }}
                />
            </div>
        </Fragment>
    );
}
