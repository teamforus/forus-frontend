import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';
import useTranslate from '../../hooks/useTranslate';
import classNames from 'classnames';
import FormGroup from '../elements/forms/elements/FormGroup';

export default function ModalFundRequestApproveMissedRecords({
    modal,
    onSubmit,
}: {
    modal: ModalState;
    onSubmit: ({ note }: { note: string }) => void;
}) {
    const translate = useTranslate();

    const form = useFormBuilder({ description: '', approve: false }, (values) => {
        onSubmit({ note: values.description });
        modal.close();
    });

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading')}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-icon">
                    <i className="mdi mdi-message-alert-outline" />
                </div>

                <div className="modal-body">
                    <div className="modal-section modal-section-pad">
                        <div className="text-center">
                            <div className="modal-heading">
                                {translate('modals.modal_fund_request_approve_missed_records.title')}
                            </div>
                            <div className="modal-text">
                                {translate('modals.modal_fund_request_approve_missed_records.description')}
                            </div>
                            <span />
                        </div>

                        <FormGroup
                            label={translate('modals.modal_fund_request_approve_missed_records.labels.note')}
                            hint={translate('modals.modal_fund_request_approve_missed_records.hints.note')}
                            error={form.errors?.description}
                            input={(id) => (
                                <textarea
                                    className="form-control r-n"
                                    id={id}
                                    maxLength={140}
                                    value={form.values.description || ''}
                                    placeholder={translate(
                                        'modals.modal_fund_request_approve_missed_records.placeholders.note',
                                    )}
                                    onChange={(e) => form.update({ description: e.target.value })}
                                />
                            )}
                        />

                        <FormGroup
                            input={() => (
                                <CheckboxControl
                                    title={translate('modals.modal_fund_request_approve_missed_records.labels.approve')}
                                    checked={form.values.approve || false}
                                    onChange={(e) => form.update({ approve: e.target.checked })}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        {translate('modals.modal_fund_request_approve_missed_records.buttons.cancel')}
                    </button>

                    <button
                        type="submit"
                        className="button button-primary"
                        disabled={form.values.description.length > 140 || !form.values.approve}>
                        {translate('modals.modal_fund_request_approve_missed_records.buttons.submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}
