import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import FormGroup from '../elements/forms/elements/FormGroup';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';
import { ModalButton } from './elements/ModalButton';
import Modal from './elements/Modal';
import useTranslate from '../../hooks/useTranslate';
import Reservation from '../../props/models/Reservation';
import Organization from '../../props/models/Organization';
import useProductReservationService from '../../services/ProductReservationService';
import { runSequentially } from '../../helpers/utils';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushApiError from '../../hooks/usePushApiError';
import { ResponseError } from '../../props/ApiResponses';
import InfoBox from '../elements/info-box/InfoBox';
import FormPane from '../elements/forms/elements/FormPane';

export default function ModalReservationApprove({
    modal,
    organization,
    reservations,
    onDone,
}: {
    modal: ModalState;
    organization: Organization;
    reservations: Reservation[];
    onDone?: () => void;
}) {
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const setProgress = useSetProgress();
    const translate = useTranslate();

    const productReservationService = useProductReservationService();

    const canShareNoteByEmail = reservations.every((reservation) => !!reservation.identity_email);

    const form = useFormBuilder(
        {
            note: '',
            share_note_by_email: false,
        },
        (values) => {
            setProgress(0);

            const total = reservations.length;
            const isSingle = reservations.length === 1;

            const tasks = reservations.map(
                (reservation, idx) => () =>
                    productReservationService.accept(organization.id, reservation.id, values).then(() => {
                        const prefix = isSingle ? '' : `${idx + 1}/${total}: `;

                        pushSuccess(
                            prefix +
                                translate('modals.modal_product_reservation_approve.success.item', {
                                    product_name: reservation.product!.name,
                                    amount: reservation.amount_locale,
                                }),
                        );
                    }),
            );

            runSequentially(tasks)
                .then(() => {
                    const successKey = isSingle
                        ? 'modals.modal_product_reservation_approve.success.single'
                        : 'modals.modal_product_reservation_approve.success.batch';

                    pushSuccess(translate(successKey));
                })
                .catch((err: ResponseError) => pushApiError(err))
                .finally(() => {
                    setProgress(100);
                    onDone?.();
                    modal.close();
                });
        },
    );

    return (
        <Modal
            modal={modal}
            title={translate('modals.modal_product_reservation_approve.modal_title')}
            headerType="danger"
            headerIcon="mdi mdi-alert"
            footerClassName="text-center"
            onSubmit={form.submit}
            footer={
                <>
                    <ModalButton
                        type="default"
                        button={{ onClick: modal.close }}
                        disabled={form.isLocked}
                        text={translate('modals.modal_product_reservation_approve.buttons.cancel')}
                    />
                    <ModalButton
                        type="primary"
                        button={{ onClick: form.submit }}
                        disabled={form.isLocked}
                        text={translate('modals.modal_product_reservation_approve.buttons.submit')}
                    />
                </>
            }>
            <div className="modal-heading">
                {translate(
                    `modals.modal_product_reservation_approve.title.${reservations.length > 1 ? 'plural' : 'single'}`,
                )}
            </div>
            <div className="modal-text">
                {translate(
                    `modals.modal_product_reservation_approve.description.${reservations.length > 1 ? 'plural' : 'single'}`,
                )
                    .split('\n')
                    .map((value: string, index: number) =>
                        value ? <div key={index}>{value}</div> : <div key={index}>&nbsp;</div>,
                    )}
            </div>

            <FormPane title={translate('modals.modal_product_reservation_approve.form_title')}>
                <FormGroup
                    required={false}
                    label={translate('modals.modal_product_reservation_approve.labels.message')}
                    info={translate('modals.modal_product_reservation_approve.tooltips.message')}
                    error={form.errors?.note}
                    input={(id) => (
                        <textarea
                            className="form-control"
                            id={id}
                            value={form.values.note}
                            placeholder={translate('modals.modal_product_reservation_approve.placeholders.message')}
                            onChange={(e) => form.update({ note: e.target.value })}
                        />
                    )}
                />

                <FormGroup
                    input={() => (
                        <CheckboxControl
                            className="checkbox-compact"
                            checked={form.values.share_note_by_email}
                            disabled={!canShareNoteByEmail}
                            title={translate('modals.modal_product_reservation_approve.labels.notify')}
                            onChange={(e) => form.update({ share_note_by_email: e.target.checked })}
                        />
                    )}
                />

                {!canShareNoteByEmail && (
                    <InfoBox type="warning" iconColor="default">
                        {translate('provider_message.info.note_email_missing')}
                    </InfoBox>
                )}
            </FormPane>
        </Modal>
    );
}
