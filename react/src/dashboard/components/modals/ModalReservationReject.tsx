import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { ModalButton } from './elements/ModalButton';
import Modal from './elements/Modal';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormGroup from '../elements/forms/elements/FormGroup';
import Reservation from '../../props/models/Reservation';
import { runSequentially } from '../../helpers/utils';
import Organization from '../../props/models/Organization';
import useProductReservationService from '../../services/ProductReservationService';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushApiError from '../../hooks/usePushApiError';
import { ResponseError } from '../../props/ApiResponses';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';
import useTranslate from '../../hooks/useTranslate';
import InfoBox from '../elements/info-box/InfoBox';
import FormPane from '../elements/forms/elements/FormPane';

export default function ModalReservationReject({
    modal,
    onDone,
    organization,
    reservations,
}: {
    modal: ModalState;
    onDone?: () => void;
    organization: Organization;
    reservations: Reservation[];
}) {
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const translate = useTranslate();

    const productReservationService = useProductReservationService();

    const hasRejections = reservations.some((reservation) => reservation.state !== 'accepted');
    const hasCancellations = reservations.some((reservation) => reservation.state === 'accepted');
    const actionType = hasRejections && hasCancellations ? 'mixed' : hasCancellations ? 'cancel' : 'reject';
    const countType = reservations.length > 1 ? 'plural' : 'single';
    const canShareNoteByEmail = reservations.every((reservation) => !!reservation.identity_email);

    const form = useFormBuilder<{ note: string; share_note_by_email: boolean }>(
        {
            note: '',
            share_note_by_email: false,
        },
        (values) => {
            const total = reservations.length;
            const isSingle = total === 1;

            const tasks = reservations.map(
                (reservation, idx) => () =>
                    productReservationService.reject(organization.id, reservation.id, values).then(() => {
                        const prefix = isSingle ? '' : `${idx + 1}/${total}: `;
                        const reservationActionType = reservation.state === 'accepted' ? 'cancel' : 'reject';

                        pushSuccess(
                            prefix +
                                translate(
                                    `modals.modal_product_reservation_reject.success.item.${reservationActionType}`,
                                    { product_name: reservation.product!.name, amount: reservation.amount_locale },
                                ),
                        );
                    }),
            );

            runSequentially(tasks)
                .then(() => {
                    const successKey = isSingle
                        ? 'modals.modal_product_reservation_reject.success.single'
                        : `modals.modal_product_reservation_reject.success.batch.${actionType}`;

                    pushSuccess(translate(successKey));
                })
                .catch((err: ResponseError) => pushApiError(err))
                .finally(() => {
                    onDone?.();
                    modal.close();
                });
        },
    );

    return (
        <Modal
            modal={modal}
            title={translate(`modals.modal_product_reservation_reject.modal_title.${actionType}`)}
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
                        text={translate('modals.modal_product_reservation_reject.buttons.cancel')}
                    />
                    <ModalButton
                        type="primary"
                        button={{ onClick: form.submit }}
                        disabled={form.isLocked}
                        text={translate('modals.modal_product_reservation_reject.buttons.submit')}
                    />
                </>
            }>
            <div className="modal-heading">
                {translate(`modals.modal_product_reservation_reject.title.${actionType}.${countType}`)}
            </div>
            <div className="modal-text">
                {translate(`modals.modal_product_reservation_reject.description.${actionType}.${countType}`)
                    .split('\n')
                    .map((value: string, index: number) =>
                        value ? <div key={index}>{value}</div> : <div key={index}>&nbsp;</div>,
                    )}
            </div>

            <FormPane title={translate('modals.modal_product_reservation_reject.form_title')}>
                <FormGroup
                    required={false}
                    label={translate('modals.modal_product_reservation_reject.labels.message')}
                    info={translate(`modals.modal_product_reservation_reject.tooltips.message.${actionType}`)}
                    error={form.errors?.note}
                    input={(id) => (
                        <textarea
                            className="form-control"
                            id={id}
                            value={form.values.note}
                            placeholder={translate('modals.modal_product_reservation_reject.placeholders.message')}
                            data-dusk="noteInput"
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
                            title={translate('modals.modal_product_reservation_reject.labels.notify')}
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
