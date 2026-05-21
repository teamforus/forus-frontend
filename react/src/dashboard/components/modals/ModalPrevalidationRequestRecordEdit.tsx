import React, { useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import { ResponseError } from '../../props/ApiResponses';
import useSetProgress from '../../hooks/useSetProgress';
import { usePrevalidationRequestService } from '../../services/PrevalidationRequestService';
import Organization from '../../props/models/Organization';
import PrevalidationRequestRecord from '../../props/models/PrevalidationRequestRecord';
import SelectControl from '../elements/select-control/SelectControl';
import classNames from 'classnames';
import FormGroup from '../elements/forms/elements/FormGroup';

export default function ModalPrevalidationRequestRecordEdit({
    modal,
    onEdit,
    organization,
    requestRecord,
}: {
    modal: ModalState;
    onEdit: (res?: ResponseError) => void;
    organization: Organization;
    requestRecord: PrevalidationRequestRecord;
}) {
    const setProgress = useSetProgress();
    const prevalidationRequestService = usePrevalidationRequestService();

    const [recordNumeric] = useState(requestRecord.record_type.type == 'number');
    const [recordSelect] = useState(requestRecord.record_type.type == 'select');
    const [initialValue] = useState(recordNumeric ? parseFloat(requestRecord.value) : requestRecord.value);

    const form = useFormBuilder(
        {
            value: initialValue,
        },
        async (values) => {
            setProgress(0);

            return prevalidationRequestService
                .updateRecord(organization.id, requestRecord.prevalidation_request_id, requestRecord.id, values)
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
            className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading')}
            data-dusk="modalPrevalidationRequestRecordEdit">
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
                                    label={requestRecord.record_type.name}
                                    error={form.errors?.value}
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
                                                    options={requestRecord.record_type.options}
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
                        disabled={initialValue == form.values?.value}>
                        Bevestigen
                    </button>
                </div>
            </form>
        </div>
    );
}
