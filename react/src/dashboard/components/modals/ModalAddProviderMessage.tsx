import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import classNames from 'classnames';
import FormGroup from '../elements/forms/elements/FormGroup';
import { ModalButton } from './elements/ModalButton';
import useTranslate from '../../hooks/useTranslate';
import { ApiResponseSingle, ResponseError } from '../../props/ApiResponses';
import usePushApiError from '../../hooks/usePushApiError';
import FormValuesModel from '../../types/FormValuesModel';
import ProviderMessage from '../../props/models/ProviderMessage';

export default function ModalAddProviderMessage({
    modal,
    onCreated,
    storeMessage,
}: {
    modal: ModalState;
    onCreated: (data: ProviderMessage) => void;
    storeMessage: (values: FormValuesModel) => Promise<ApiResponseSingle<ProviderMessage>>;
}) {
    const setProgress = useSetProgress();
    const translate = useTranslate();
    const pushApiError = usePushApiError();

    const form = useFormBuilder({ message: '' }, (values) => {
        setProgress(0);

        return storeMessage(values)
            .then((res) => {
                onCreated(res?.data?.data);
                modal.close();
            })
            .catch((err: ResponseError) => {
                form.setErrors(err?.data?.errors);
                form.setIsLocked(false);
                pushApiError(err);
            })
            .finally(() => setProgress(100));
    });

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading')}>
            <div className="modal-backdrop" onClick={modal.close} />
            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-close mdi mdi-close" onClick={modal.close} role="button" />
                <div className="modal-header modal-header-danger">
                    <em className="mdi mdi-alert" />
                    {translate('modals.modal_product_reservation_send_mail.modal_title')}
                </div>
                <div className="modal-body">
                    <div className="modal-section">
                        <div className="modal-heading">
                            {translate('modals.modal_product_reservation_send_mail.title')}
                        </div>
                        <div className="modal-text">
                            {translate('modals.modal_product_reservation_send_mail.description')}
                        </div>
                    </div>
                    <div className="modal-section">
                        <FormGroup
                            required={false}
                            label={translate('modals.modal_product_reservation_send_mail.labels.message')}
                            info={translate('modals.modal_product_reservation_send_mail.tooltips.message')}
                            error={form.errors?.message}
                            input={(id) => (
                                <textarea
                                    className="form-control"
                                    id={id}
                                    value={form.values.message}
                                    placeholder={translate(
                                        'modals.modal_product_reservation_send_mail.placeholders.message',
                                    )}
                                    onChange={(e) => form.update({ message: e.target.value })}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <ModalButton
                        type="default"
                        button={{ onClick: modal.close }}
                        disabled={form.isLoading}
                        text={translate('modals.modal_product_reservation_send_mail.buttons.cancel')}
                    />
                    <ModalButton
                        type="primary"
                        button={{ onClick: form.submit }}
                        disabled={form.isLoading}
                        text={translate('modals.modal_product_reservation_send_mail.buttons.submit')}
                    />
                </div>
            </form>
        </div>
    );
}
