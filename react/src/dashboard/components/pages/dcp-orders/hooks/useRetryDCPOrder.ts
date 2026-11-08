import { useCallback, useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import usePushDanger from '../../../../hooks/usePushDanger';
import usePushApiError from '../../../../hooks/usePushApiError';
import useConfirmDangerAction from '../../../../hooks/useConfirmDangerAction';
import { useDCPOrderService } from '../../../../services/DCPOrderService';
import Organization from '../../../../props/models/Organization';
import DCPOrder from '../../../../props/models/DCPOrder';

export default function useRetryDCPOrder(organization: Organization, onChange?: () => void) {
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const pushDanger = usePushDanger();
    const pushApiError = usePushApiError();
    const confirmDangerAction = useConfirmDangerAction();
    const dcpOrderService = useDCPOrderService();

    const [retrying, setRetrying] = useState<number>(null);

    const retry = useCallback(
        (order: DCPOrder) => {
            confirmDangerAction(
                translate('dcp_orders.confirm_retry.title'),
                translate(
                    order.payload_edited_at
                        ? 'dcp_orders.confirm_retry.description_edited'
                        : 'dcp_orders.confirm_retry.description',
                    {
                        id: order.id,
                        bulk: order.dcp_order_bulk_id
                            ? translate('dcp_orders.confirm_retry.in_bulk')
                            : translate('dcp_orders.confirm_retry.no_bulk'),
                    },
                ),
                translate('dcp_orders.confirm_retry.confirm'),
                translate('dcp_orders.confirm_retry.cancel'),
            ).then((confirmed) => {
                if (!confirmed) {
                    return;
                }

                setRetrying(order.id);

                dcpOrderService
                    .retry(organization.id, order.id)
                    .then((res) => {
                        if (res.data.data.state === 'error') {
                            pushDanger(
                                translate('dcp_orders.notifications.retry_failed'),
                                res.data.data.status_message,
                            );
                        } else {
                            pushSuccess(translate('dcp_orders.notifications.retried'));
                        }
                    })
                    .catch(pushApiError)
                    .finally(() => {
                        setRetrying(null);
                        onChange?.();
                    });
            });
        },
        [
            confirmDangerAction,
            dcpOrderService,
            onChange,
            organization.id,
            pushApiError,
            pushDanger,
            pushSuccess,
            translate,
        ],
    );

    return { retry, retrying };
}
