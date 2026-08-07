import React from 'react';
import classNames from 'classnames';
import { ModalState } from '../../../modules/modals/context/ModalContext';
import useFormBuilder from '../../../hooks/useFormBuilder';
import FormGroup from '../../elements/forms/elements/FormGroup';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import useTranslate from '../../../hooks/useTranslate';

export default function ModalApproveMissedRecordsBase({
    modal,
    onSubmit,
    title,
    description,
    noteLabel,
    noteHint,
    notePlaceholder,
    approveLabel,
}: {
    modal: ModalState;
    onSubmit: ({ note }: { note: string }) => void;
    title: string;
    description: string;
    noteLabel: string;
    noteHint: string;
    notePlaceholder: string;
    approveLabel: string;
}) {
    const translate = useTranslate();

    const form = useFormBuilder({ description: '', approve: false }, (values) => {
        onSubmit({ note: values.description });
        modal.close();
    });

    return (
        <div
            className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading')}
            data-dusk="fundRequestApproveMissedRecordsModal">
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-icon">
                    <i className="mdi mdi-message-alert-outline" />
                </div>

                <div className="modal-body">
                    <div className="modal-section modal-section-pad">
                        <div className="text-center">
                            <div className="modal-heading">{title}</div>
                            <div className="modal-text">{description}</div>
                            <span />
                        </div>

                        <FormGroup
                            label={noteLabel}
                            hint={noteHint}
                            error={form.errors?.description}
                            input={(id) => (
                                <textarea
                                    className="form-control r-n"
                                    id={id}
                                    maxLength={140}
                                    value={form.values.description || ''}
                                    placeholder={notePlaceholder}
                                    onChange={(e) => form.update({ description: e.target.value })}
                                />
                            )}
                        />

                        <FormGroup
                            input={(id) => (
                                <CheckboxControl
                                    id={id}
                                    title={approveLabel}
                                    checked={form.values.approve || false}
                                    dusk="approveCheckbox"
                                    onChange={(e) => form.update({ approve: e.target.checked })}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        {translate('modal.buttons.cancel')}
                    </button>

                    <button
                        type="submit"
                        className="button button-primary"
                        data-dusk="approveBtn"
                        disabled={form.values.description.length > 140 || !form.values.approve}>
                        {translate('modal.buttons.confirm')}
                    </button>
                </div>
            </form>
        </div>
    );
}
