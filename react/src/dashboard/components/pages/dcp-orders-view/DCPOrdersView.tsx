import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import useTranslate from '../../../hooks/useTranslate';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import usePushApiError from '../../../hooks/usePushApiError';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushSuccess from '../../../hooks/usePushSuccess';
import useOpenModal from '../../../hooks/useOpenModal';
import useConfirmDangerAction from '../../../hooks/useConfirmDangerAction';
import { hasPermission } from '../../../helpers/utils';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import { useDCPOrderService } from '../../../services/DCPOrderService';
import { Permission } from '../../../props/models/Organization';
import DCPOrder, { DCPOrderField, DCPOrderTagField } from '../../../props/models/DCPOrder';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import KeyValueItem from '../../elements/key-value/KeyValueItem';
import Label from '../../elements/label/Label';
import InfoBox from '../../elements/info-box/InfoBox';
import EventLogsTable from '../../elements/tables/EventLogsTable';
import { dcpOrderStateKey, dcpOrderStateLabelTypes } from '../dcp-orders/elements/DCPOrderState';
import useRetryDCPOrder from '../dcp-orders/hooks/useRetryDCPOrder';
import ModalDCPOrderEdit from '../../modals/ModalDCPOrderEdit';
import ModalDCPOrderIdDcp from '../../modals/ModalDCPOrderIdDcp';

export default function DCPOrdersView() {
    const orderId = parseInt(useParams().id);

    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const pushSuccess = usePushSuccess();
    const openModal = useOpenModal();
    const confirmDangerAction = useConfirmDangerAction();
    const activeOrganization = useActiveOrganization();

    const dcpOrderService = useDCPOrderService();

    const [order, setOrder] = useState<DCPOrder>(null);
    const fetchEventLogsRef = useRef<() => void>(null);

    const canManage = hasPermission(activeOrganization, Permission.MANAGE_VOUCHERS);

    const fetchOrder = useCallback(() => {
        setProgress(0);

        dcpOrderService
            .show(activeOrganization.id, orderId)
            .then((res) => setOrder(res.data.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [activeOrganization.id, orderId, dcpOrderService, pushApiError, setProgress]);

    const refresh = useCallback(() => {
        fetchOrder();
        fetchEventLogsRef.current?.();
    }, [fetchOrder]);

    const { retry, retrying } = useRetryDCPOrder(activeOrganization, refresh);

    const editPayload = useCallback(() => {
        openModal((modal) => (
            <ModalDCPOrderEdit
                modal={modal}
                order={order}
                organization={activeOrganization}
                onUpdated={(order) => {
                    setOrder(order);
                    fetchEventLogsRef.current?.();
                }}
            />
        ));
    }, [activeOrganization, openModal, order]);

    const setOrderIdDcp = useCallback(() => {
        openModal((modal) => (
            <ModalDCPOrderIdDcp
                modal={modal}
                order={order}
                organization={activeOrganization}
                onUpdated={(order) => {
                    setOrder(order);
                    fetchEventLogsRef.current?.();
                }}
            />
        ));
    }, [activeOrganization, openModal, order]);

    const resetPayload = useCallback(() => {
        confirmDangerAction(
            translate('dcp_orders_view.confirm_reset.title'),
            translate('dcp_orders_view.confirm_reset.description', { id: order.id }),
            translate('dcp_orders_view.confirm_reset.confirm'),
            translate('dcp_orders_view.confirm_reset.cancel'),
        ).then((confirmed) => {
            if (!confirmed) {
                return;
            }

            setProgress(0);

            dcpOrderService
                .resetPayload(activeOrganization.id, order.id)
                .then(() => pushSuccess(translate('dcp_orders_view.notifications.reset')))
                .catch(pushApiError)
                .finally(() => {
                    setProgress(100);
                    refresh();
                });
        });
    }, [
        activeOrganization.id,
        confirmDangerAction,
        dcpOrderService,
        order?.id,
        pushApiError,
        pushSuccess,
        refresh,
        setProgress,
        translate,
    ]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    if (!order) {
        return <LoadingCard />;
    }

    const state = dcpOrderStateKey(order);
    const canEdit = canManage && order.is_editable;

    const editButton = canEdit && (
        <button type="button" className="button button-default button-sm" onClick={editPayload}>
            <em className="mdi mdi-pencil-outline icon-start" />
            {translate('dcp_orders_view.buttons.edit')}
        </button>
    );

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={DashboardRoutes.DCP_ORDERS}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {translate('dcp_orders.header.title')}
                </StateNavLink>
                {order.dcp_order_bulk_id && (
                    <StateNavLink
                        name={DashboardRoutes.DCP_ORDER_BULK}
                        params={{ organizationId: activeOrganization.id, id: order.dcp_order_bulk_id }}
                        activeExact={true}
                        className="breadcrumb-item">
                        {translate('dcp_orders.labels.bulk', { id: order.dcp_order_bulk_id })}
                    </StateNavLink>
                )}
                <div className="breadcrumb-item active">{`#${order.id}`}</div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex flex-grow card-title flex-align-items-center flex-gap">
                        <span>{translate('dcp_orders_view.header.title', { id: order.id })}</span>
                        <Label type={dcpOrderStateLabelTypes[state]} nowrap={true}>
                            {translate(`dcp_orders.states.${state}`)}
                        </Label>
                    </div>
                    <div className="card-header-filters">
                        <div className="block block-inline-filters">
                            {canEdit && order.payload_edited_at && (
                                <button
                                    type="button"
                                    className="button button-default button-sm"
                                    onClick={resetPayload}>
                                    <em className="mdi mdi-restore icon-start" />
                                    {translate('dcp_orders_view.buttons.reset')}
                                </button>
                            )}
                            {editButton}
                            {canManage && order.is_duplicate && (
                                <button
                                    type="button"
                                    className="button button-primary button-sm"
                                    onClick={setOrderIdDcp}>
                                    <em className="mdi mdi-pencil-outline icon-start" />
                                    {translate('dcp_orders.buttons.set_order_id_dcp')}
                                </button>
                            )}
                            {canManage && order.state === 'error' && (
                                <button
                                    type="button"
                                    className="button button-primary button-sm"
                                    disabled={retrying === order.id}
                                    onClick={() => retry(order)}>
                                    <em
                                        className={
                                            retrying === order.id
                                                ? 'mdi mdi-loading mdi-spin icon-start'
                                                : 'mdi mdi-refresh icon-start'
                                        }
                                    />
                                    {translate('dcp_orders.buttons.retry')}
                                </button>
                            )}
                            <button type="button" className="button button-default button-sm" onClick={refresh}>
                                <em className="mdi mdi-reload icon-start" />
                                {translate('dcp_orders_view.buttons.refresh')}
                            </button>
                        </div>
                    </div>
                </div>

                {order.state === 'error' && (
                    <div className="card-section card-section-narrow">
                        <InfoBox type="danger" iconType="warning" iconColor="warning">
                            <p>
                                <strong>{translate('dcp_orders_view.errors.title')}</strong>
                            </p>
                            {order.status_message && <p>{order.status_message}</p>}
                            {order.validation_errors.length > 0 && (
                                <Fragment>
                                    <p>{translate('dcp_orders_view.errors.validation_errors')}</p>
                                    <ul>
                                        {order.validation_errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </Fragment>
                            )}
                        </InfoBox>
                    </div>
                )}

                {order.is_duplicate && (
                    <div className="card-section card-section-narrow">
                        <InfoBox type="warning" iconType="warning" iconColor="warning">
                            <p>{translate('dcp_orders_view.errors.duplicate')}</p>
                            <p>
                                {translate('dcp_orders.set_order_id_dcp.info_reference', { order_id: order.order_id })}
                            </p>
                        </InfoBox>
                    </div>
                )}

                {order.state === 'pending' && !order.dcp_connection_active && (
                    <div className="card-section card-section-narrow">
                        <InfoBox type="warning" iconType="warning" iconColor="warning">
                            <p>{translate('dcp_orders_view.errors.connection_inactive')}</p>
                        </InfoBox>
                    </div>
                )}

                <div className="card-section">
                    <div className="card-block card-block-keyvalue">
                        <KeyValueItem label={translate('dcp_orders_view.labels.id')}>{order.id}</KeyValueItem>
                        <KeyValueItem label={translate('dcp_orders_view.labels.order_id')}>
                            {order.order_id}
                        </KeyValueItem>
                        <KeyValueItem label={translate('dcp_orders_view.labels.order_id_dcp')}>
                            {order.order_id_dcp}
                        </KeyValueItem>
                        <KeyValueItem label={translate('dcp_orders_view.labels.status')}>
                            {[order.status_locale, order.state !== 'error' ? order.status_message : null]
                                .filter((value) => value)
                                .join(' - ')}
                        </KeyValueItem>
                        <KeyValueItem label={translate('dcp_orders_view.labels.source')}>
                            {order.orderable && (
                                <div className="flex flex-vertical">
                                    <div>{order.orderable.name}</div>
                                    {order.orderable.voucher_id && (
                                        <StateNavLink
                                            className={'text-primary text-underline text-semibold'}
                                            name={DashboardRoutes.VOUCHER}
                                            params={{
                                                id: order.orderable.voucher_id,
                                                organizationId: activeOrganization.id,
                                            }}>
                                            {translate('dcp_orders.labels.voucher', {
                                                number: order.orderable.voucher_number,
                                            })}
                                        </StateNavLink>
                                    )}
                                </div>
                            )}
                        </KeyValueItem>
                        <KeyValueItem label={translate('dcp_orders_view.labels.implementation')}>
                            {order.implementation?.name}
                        </KeyValueItem>
                        <KeyValueItem label={translate('dcp_orders_view.labels.bulk')}>
                            {order.dcp_order_bulk_id && (
                                <StateNavLink
                                    className={'text-primary text-underline text-semibold'}
                                    name={DashboardRoutes.DCP_ORDER_BULK}
                                    params={{ id: order.dcp_order_bulk_id, organizationId: activeOrganization.id }}>
                                    {translate('dcp_orders.labels.bulk', { id: order.dcp_order_bulk_id })}
                                </StateNavLink>
                            )}
                        </KeyValueItem>
                        <KeyValueItem label={translate('dcp_orders_view.labels.label')}>{order.label}</KeyValueItem>
                        <KeyValueItem label={translate('dcp_orders_view.labels.item')}>{order.item}</KeyValueItem>
                        <KeyValueItem label={translate('dcp_orders_view.labels.attempts')}>
                            {order.attempts.toString()}
                        </KeyValueItem>
                        <KeyValueItem label={translate('dcp_orders_view.labels.response_code')}>
                            {order.response_code}
                        </KeyValueItem>
                        <KeyValueItem label={translate('dcp_orders_view.labels.created_at')}>
                            {order.created_at_locale}
                        </KeyValueItem>
                        <KeyValueItem label={translate('dcp_orders_view.labels.last_attempt_at')}>
                            {order.last_attempt_at_locale}
                        </KeyValueItem>
                        <KeyValueItem label={translate('dcp_orders_view.labels.shipped_at')}>
                            {order.shipped_at_locale}
                        </KeyValueItem>
                        {order.payload_edited_at && (
                            <KeyValueItem label={translate('dcp_orders_view.labels.payload_edited')}>
                                {translate('dcp_orders_view.labels.payload_edited_value', {
                                    date: order.payload_edited_at_locale,
                                    email: order.payload_edited_by_employee_email || '-',
                                })}
                            </KeyValueItem>
                        )}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex flex-grow card-title">
                        {translate('dcp_orders_view.header.delivery_address')}
                    </div>
                    {editButton && <div className="card-header-filters">{editButton}</div>}
                </div>
                <div className="card-section">
                    <div className="card-block card-block-keyvalue">
                        {order.delivery_address_fields.map((field) => (
                            <KeyValueItem key={field.key} label={field.key}>
                                <DCPOrderFieldValue field={field} />
                            </KeyValueItem>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex flex-grow card-title">
                        {translate('dcp_orders_view.header.tag_fields')} ({order.tag_fields.length})
                    </div>
                    {editButton && <div className="card-header-filters">{editButton}</div>}
                </div>
                <div className="card-section">
                    <div className="card-block card-block-keyvalue">
                        {order.tag_fields.map((field) => (
                            <KeyValueItem key={field.key} label={field.key}>
                                <DCPOrderFieldValue field={field} />
                            </KeyValueItem>
                        ))}
                    </div>
                </div>
            </div>

            <EventLogsTable
                title={translate('dcp_orders_view.header.history')}
                loggable={['dcp_order']}
                loggableId={order.id}
                organization={activeOrganization}
                hideEntity={true}
                hideFilterDropdown={true}
                fetchEventLogsRef={fetchEventLogsRef}
            />
        </Fragment>
    );
}

function DCPOrderFieldValue({ field }: { field: DCPOrderField | DCPOrderTagField }) {
    const translate = useTranslate();
    const tagField = field as DCPOrderTagField;

    const details = [
        tagField.source_locale
            ? translate('dcp_orders_view.labels.source_field', { source: tagField.source_locale })
            : null,
        field.required ? translate('dcp_orders_view.labels.required') : null,
        tagField.max ? translate('dcp_orders_view.labels.max', { max: tagField.max }) : null,
    ].filter((value) => value);

    return (
        <div className="flex flex-vertical flex-gap-xs">
            {field.value ? (
                <div className="text-strong">{field.value}</div>
            ) : (
                <div className={field.required ? 'text-danger' : 'text-muted'}>
                    {field.required ? translate('dcp_orders_view.labels.missing_required') : '-'}
                </div>
            )}

            {details.length > 0 && <div className="text-muted">{details.join(' · ')}</div>}

            {field.errors.map((error, index) => (
                <div key={index} className="text-danger">
                    {error}
                </div>
            ))}
        </div>
    );
}
