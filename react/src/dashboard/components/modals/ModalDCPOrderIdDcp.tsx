import React from 'react';
import classNames from 'classnames';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import useTranslate from '../../hooks/useTranslate';
import usePushApiError from '../../hooks/usePushApiError';
import usePushSuccess from '../../hooks/usePushSuccess';
import { ResponseError } from '../../props/ApiResponses';
import Organization from '../../props/models/Organization';
import DCPOrder from '../../props/models/DCPOrder';
import { useDCPOrderService } from '../../services/DCPOrderService';
import FormGroup from '../elements/forms/elements/FormGroup';
import InfoBox from '../elements/info-box/InfoBox';

export default function ModalDCPOrderIdDcp({
    modal,
    order,
    organization,
    className,
    onUpdated,
}: {
    modal: ModalState;
    order: DCPOrder;
    organization: Organization;
    className?: string;
    onUpdated: (order: DCPOrder) => void;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const dcpOrderService = useDCPOrderService();

    const form = useFormBuilder<{ order_id_dcp: string }>({ order_id_dcp: '' }, (values) => {
        setProgress(0);

        dcpOrderService
            .setOrderIdDcp(organization.id, order.id, values.order_id_dcp)
            .then((res) => {
                pushSuccess(translate('dcp_orders.notifications.order_id_dcp_set'));
                onUpdated(res.data.data);
                modal.close();
            })
            .catch((err: ResponseError) => {
                form.setErrors(err.data?.errors || {});
                pushApiError(err);
            })
            .finally(() => {
                setProgress(100);
                form.setIsLocked(false);
            });
    });

    return (
        <div className={classNames('modal', 'modal-animated', 'modal-md', modal.loading && 'modal-loading', className)}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />

                <div className="modal-header">{translate('dcp_orders.set_order_id_dcp.title', { id: order.id })}</div>

                <div className="modal-body">
                    <div className="modal-section modal-section-pad">
                        <InfoBox>
                            <p>{translate('dcp_orders.set_order_id_dcp.info')}</p>
                            <p>
                                {translate('dcp_orders.set_order_id_dcp.info_reference', { order_id: order.order_id })}
                            </p>
                        </InfoBox>
                    </div>

                    <div className="modal-section modal-section-pad">
                        <FormGroup
                            label={translate('dcp_orders.set_order_id_dcp.label')}
                            required={true}
                            error={form.errors?.order_id_dcp}
                            input={(id) => (
                                <input
                                    id={id}
                                    type="text"
                                    className="form-control"
                                    maxLength={100}
                                    autoFocus={true}
                                    placeholder={translate('dcp_orders.set_order_id_dcp.label')}
                                    value={form.values.order_id_dcp}
                                    onChange={(e) => form.update({ order_id_dcp: e.target.value })}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="button-group flex-center">
                        <button className="button button-default" type="button" onClick={modal.close}>
                            {translate('dcp_orders.set_order_id_dcp.cancel')}
                        </button>
                        <button
                            className="button button-primary"
                            type="submit"
                            disabled={form.isLocked || !form.values.order_id_dcp.trim()}>
                            {translate('dcp_orders.set_order_id_dcp.save')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
