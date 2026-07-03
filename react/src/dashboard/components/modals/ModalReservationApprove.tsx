import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import classNames from 'classnames';
import FormGroup from '../elements/forms/elements/FormGroup';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';
import { ModalButton } from './elements/ModalButton';
import useTranslate from '../../hooks/useTranslate';
import Reservation from '../../props/models/Reservation';
import Organization from '../../props/models/Organization';
import useProductReservationService from '../../services/ProductReservationService';
import { runSequentially } from '../../helpers/utils';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushApiError from '../../hooks/usePushApiError';

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

    const form = useFormBuilder({ note: '', share_note_by_email: false }, (values) => {
        setProgress(0);

        const total = reservations.length;
        const isSingle = reservations.length === 1;

        const tasks = reservations.map(
            (reservation, idx) => () =>
                productReservationService.accept(organization.id, reservation.id, values).then(() => {
                    const prefix = isSingle ? '' : `${idx + 1}/${total}: `;

                    pushSuccess(
                        `${prefix}Reservering voor ${reservation.product!.name} voor ${reservation.amount_locale} geaccepteerd.`,
                    );
                }),
        );

        runSequentially(tasks)
            .then(() => {
                if (isSingle) {
                    pushSuccess('Opgeslagen!');
                } else {
                    pushSuccess('Alle reserveringen zijn geaccepteerd.');
                }

                onDone?.();
                modal.close();
            })
            .catch(pushApiError)
            .then(() => setProgress(100));
    });

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading')}>
            <div className="modal-backdrop" onClick={modal.close} />
            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-close mdi mdi-close" onClick={modal.close} role="button" />
                <div className="modal-header modal-header-danger">
                    <em className="mdi mdi-alert" />
                    {translate('modals.modal_product_reservation_approve.modal_title')}
                </div>
                <div className="modal-body">
                    <div className="modal-section">
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
                    </div>
                    <div className="modal-section">
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
                                    placeholder={translate(
                                        'modals.modal_product_reservation_approve.placeholders.message',
                                    )}
                                    onChange={(e) => form.update({ note: e.target.value })}
                                />
                            )}
                        />

                        <FormGroup
                            input={() => (
                                <CheckboxControl
                                    className="checkbox-compact"
                                    checked={form.values.share_note_by_email}
                                    title={translate('modals.modal_product_reservation_approve.labels.notify')}
                                    onChange={(e) => form.update({ share_note_by_email: e.target.checked })}
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
                        text={translate('modals.modal_product_reservation_approve.buttons.cancel')}
                    />
                    <ModalButton
                        type="primary"
                        button={{ onClick: form.submit }}
                        disabled={form.isLoading}
                        text={translate('modals.modal_product_reservation_approve.buttons.submit')}
                    />
                </div>
            </form>
        </div>
    );
}
