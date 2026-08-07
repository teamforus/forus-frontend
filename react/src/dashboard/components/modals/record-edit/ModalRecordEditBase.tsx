import React, { useState } from 'react';
import classNames from 'classnames';
import { ModalState } from '../../../modules/modals/context/ModalContext';
import useFormBuilder from '../../../hooks/useFormBuilder';
import { ResponseError } from '../../../props/ApiResponses';
import useSetProgress from '../../../hooks/useSetProgress';
import RecordType from '../../../props/models/RecordType';
import SelectControl from '../../elements/select-control/SelectControl';
import FormGroup from '../../elements/forms/elements/FormGroup';

export type ModalRecordEditValues = {
    value: string | number;
};

export default function ModalRecordEditBase({
    modal,
    onEdit,
    onSubmit,
    className,
    dataDusk,
    recordTypeKey,
    hint,
    initialValue,
    recordType,
}: {
    modal: ModalState;
    onEdit: (res?: ResponseError) => void;
    onSubmit: (values: ModalRecordEditValues) => Promise<unknown>;
    className?: string;
    dataDusk: string;
    recordTypeKey: string;
    hint?: string;
    initialValue: string | number;
    recordType?: {
        type?: RecordType['type'] | null;
        name?: RecordType['name'] | null;
        options?: RecordType['options'] | null;
    } | null;
}) {
    const setProgress = useSetProgress();

    const recordTypeName = recordType?.name || recordTypeKey;

    const [recordNumeric] = useState(recordType?.type == 'number');
    const [recordSelect] = useState(recordType?.type == 'select');
    const [initialFormValue] = useState(initialValue);

    const form = useFormBuilder<ModalRecordEditValues>(
        {
            value: initialFormValue,
        },
        async (values) => {
            setProgress(0);

            return onSubmit(values)
                .then(() => {
                    modal.close();
                    onEdit();
                })
                .catch((err: ResponseError) => {
                    form.setIsLocked(false);
                    form.setErrors(err.data.errors);
                })
                .finally(() => setProgress(100));
        },
    );

    return (
        <div
            className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading', className)}
            data-dusk={dataDusk}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">Persoonsgegevens aanpassen</div>
                <div className="modal-body modal-body-visible">
                    <div className="modal-section form">
                        <div className="row">
                            <div className="col col-lg-8 col-lg-offset-2 col-lg-12">
                                <FormGroup
                                    required={true}
                                    label={recordTypeName}
                                    error={form.errors?.value}
                                    hint={hint}
                                    input={(id) => (
                                        <>
                                            {recordNumeric && (
                                                <input
                                                    className="form-control"
                                                    id={id}
                                                    value={form.values.value}
                                                    type="number"
                                                    data-dusk="numberInput"
                                                    onChange={(e) => form.update({ value: e.target.value })}
                                                    step={1}
                                                />
                                            )}

                                            {recordSelect && (
                                                <SelectControl
                                                    id={id}
                                                    value={form.values.value}
                                                    propKey={'value'}
                                                    onChange={(value: string | number) => form.update({ value })}
                                                    options={recordType?.options || []}
                                                    allowSearch={false}
                                                />
                                            )}

                                            {!recordNumeric && !recordSelect && (
                                                <input
                                                    className="form-control"
                                                    id={id}
                                                    value={form.values.value}
                                                    onChange={(e) => form.update({ value: e.target.value })}
                                                />
                                            )}
                                        </>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <button className="button button-default" type="button" onClick={modal.close} id="close">
                        Sluiten
                    </button>
                    <button
                        className="button button-primary"
                        type="submit"
                        data-dusk="submitBtn"
                        disabled={initialFormValue == form.values?.value}>
                        Bevestigen
                    </button>
                </div>
            </form>
        </div>
    );
}
