import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import FormGroup from '../elements/forms/elements/FormGroup';
import { ModalButton } from './elements/ModalButton';
import Modal from './elements/Modal';
import useTranslate from '../../hooks/useTranslate';
import { ApiResponseSingle, ResponseError } from '../../props/ApiResponses';
import usePushApiError from '../../hooks/usePushApiError';
import FormValuesModel from '../../types/FormValuesModel';
import ProviderMessage from '../../props/models/ProviderMessage';
import FormPane from '../elements/forms/elements/FormPane';

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
        <Modal
            modal={modal}
            title={translate('modals.modal_product_reservation_send_mail.modal_title')}
            headerType="danger"
            headerIcon="mdi mdi-alert"
            footerClassName="text-center"
            onSubmit={form.submit}
            footer={
                <>
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
                </>
            }>
            <div className="modal-heading">{translate('modals.modal_product_reservation_send_mail.title')}</div>
            <div className="modal-text">{translate('modals.modal_product_reservation_send_mail.description')}</div>

            <FormPane title={translate('modals.modal_product_reservation_send_mail.form_title')}>
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
                            placeholder={translate('modals.modal_product_reservation_send_mail.placeholders.message')}
                            onChange={(e) => form.update({ message: e.target.value })}
                        />
                    )}
                />
            </FormPane>
        </Modal>
    );
}
