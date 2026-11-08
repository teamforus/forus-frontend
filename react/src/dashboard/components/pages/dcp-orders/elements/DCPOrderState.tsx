import React from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import DCPOrder from '../../../../props/models/DCPOrder';
import Label, { LabelType } from '../../../elements/label/Label';

export type DCPOrderStateKey = DCPOrder['state'] | 'approved' | 'duplicate';

export type DCPOrderStateGroup = 'pending' | 'error' | 'duplicate' | 'in_progress' | 'done';

export const dcpOrderStateGroups: Array<DCPOrderStateGroup> = ['pending', 'error', 'duplicate', 'in_progress', 'done'];

export const dcpOrderStateLabelTypes: { [key in DCPOrderStateKey]: LabelType } = {
    pending: 'default',
    approved: 'primary-light',
    sent: 'primary',
    duplicate: 'danger-light',
    error: 'danger',
    closed: 'success',
    canceled: 'warning',
};

export const dcpOrderStateKey = (
    order: Pick<DCPOrder, 'state' | 'dcp_order_bulk_id' | 'order_id_dcp'>,
): DCPOrderStateKey => {
    if (order.state === 'pending' && order.dcp_order_bulk_id) {
        return 'approved';
    }

    return order.state === 'sent' && !order.order_id_dcp ? 'duplicate' : order.state;
};

export default function DCPOrderState({
    order,
}: {
    order: Pick<DCPOrder, 'state' | 'dcp_order_bulk_id' | 'order_id_dcp' | 'status_locale' | 'status_message'>;
}) {
    const translate = useTranslate();
    const state = dcpOrderStateKey(order);

    const status = [order.status_locale, order.status_message]
        .filter((value, index, list) => value && list.indexOf(value) === index)
        .join(' - ');

    return (
        <div className="flex flex-vertical flex-gap-xs">
            <div>
                <Label type={dcpOrderStateLabelTypes[state]} nowrap={true}>
                    {translate(`dcp_orders.states.${state}`)}
                </Label>
            </div>
            {status && <div className="text-muted">{status}</div>}
        </div>
    );
}
