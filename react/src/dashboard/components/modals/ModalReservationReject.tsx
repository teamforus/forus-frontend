import React, { Fragment, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { ModalButton } from './elements/ModalButton';
import classNames from 'classnames';
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
import InfoBox from '../elements/info-box/InfoBox';
import useTranslate from '../../hooks/useTranslate';

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

    const [showInfoBlock, setShowInfoBlock] = useState(false);

    const productReservationService = useProductReservationService();

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

                        pushSuccess(
                            `${prefix}Reservering voor ${reservation.product!.name} voor ${reservation.amount_locale} geannuleerd.`,
                        );
                    }),
            );

            runSequentially(tasks)
                .then(() => {
                    if (isSingle) {
                        pushSuccess('Opgeslagen!');
                    } else {
                        pushSuccess('Alle reserveringen zijn geannuleerd.');
                    }

                    onDone?.();
                    modal.close();
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err?.data?.errors);
                    form.setIsLocked(false);
                    pushApiError(err);
                });
        },
    );

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading')}>
            <div className="modal-backdrop" onClick={modal.close} />
            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-close mdi mdi-close" onClick={modal.close} role="button" />
                <div className="modal-header modal-header-danger">
                    <em className="mdi mdi-alert" />
                    {translate('modals.modal_product_reservation_reject.modal_title')}
                </div>
                <div className="modal-body">
                    <div className="modal-section">
                        <div className="modal-heading">
                            {translate(
                                `modals.modal_product_reservation_reject.title.${reservations.length > 1 ? 'plural' : 'single'}`,
                            )}
                        </div>
                        <div className="modal-text">
                            {translate(
                                `modals.modal_product_reservation_reject.description.${reservations.length > 1 ? 'plural' : 'single'}`,
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
                            label={translate('modals.modal_product_reservation_reject.labels.message')}
                            info={translate('modals.modal_product_reservation_reject.tooltips.message')}
                            error={form.errors?.note}
                            input={(id) => (
                                <textarea
                                    className="form-control"
                                    id={id}
                                    value={form.values.note}
                                    placeholder={translate(
                                        'modals.modal_product_reservation_reject.placeholders.message',
                                    )}
                                    data-dusk="noteInput"
                                    onChange={(e) => form.update({ note: e.target.value })}
                                />
                            )}
                        />

                        <FormGroup
                            input={() => (
                                <Fragment>
                                    <div className="flex flex-vertical flex-gap">
                                        <div className="flex flex-align-items-center flex-gap-sm">
                                            <CheckboxControl
                                                className="checkbox-compact"
                                                checked={form.values.share_note_by_email}
                                                title={translate(
                                                    'modals.modal_product_reservation_reject.labels.notify',
                                                )}
                                                onChange={(e) => form.update({ share_note_by_email: e.target.checked })}
                                            />
                                            <div className="block block-form_tooltip">
                                                <div
                                                    className="tooltip-icon"
                                                    onClick={() => setShowInfoBlock(!showInfoBlock)}>
                                                    <em className="mdi mdi-information" />
                                                </div>
                                            </div>
                                        </div>

                                        {showInfoBlock && (
                                            <InfoBox>
                                                {translate('modals.modal_product_reservation_reject.tooltips.notify')}
                                            </InfoBox>
                                        )}
                                    </div>
                                </Fragment>
                            )}
                        />
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <ModalButton
                        type="default"
                        button={{ onClick: modal.close }}
                        disabled={form.isLoading}
                        text={translate('modals.modal_product_reservation_reject.buttons.cancel')}
                    />
                    <ModalButton
                        type="primary"
                        button={{ onClick: form.submit }}
                        disabled={form.isLoading}
                        text={translate('modals.modal_product_reservation_reject.buttons.submit')}
                    />
                </div>
            </form>
        </div>
    );
}
