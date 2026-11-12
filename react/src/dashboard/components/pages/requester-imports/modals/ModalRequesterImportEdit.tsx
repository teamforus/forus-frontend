import React, { useCallback, useEffect, useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import useCanManageRequesterImports from '../../../../hooks/permissions/useCanManageRequesterImports';
import { dateFormat, dateParse } from '../../../../helpers/dates';
import { useRequesterImportService } from '../../../../services/RequesterImportService';
import RequesterImportRow, { RequesterImportRecordType } from '../../../../props/models/RequesterImportRow';
import { ResponseError } from '../../../../props/ApiResponses';
import { ModalState } from '../../../../modules/modals/context/ModalContext';
import FormGroup from '../../../elements/forms/elements/FormGroup';
import FormPane from '../../../elements/forms/elements/FormPane';
import FormError from '../../../elements/forms/errors/FormError';
import DatePickerControl from '../../../elements/forms/controls/DatePickerControl';
import SelectControl from '../../../elements/select-control/SelectControl';
import Modal from '../../../modals/elements/Modal';

export default function ModalRequesterImportEdit({
    modal,
    row,
    recordTypes,
    onChanged,
}: {
    modal: ModalState;
    row: RequesterImportRow;
    recordTypes: RequesterImportRecordType[];
    onChanged: () => void;
}) {
    const translate = useTranslate();
    const organization = useActiveOrganization();
    const canManageRequesterImports = useCanManageRequesterImports();

    const requesterImportService = useRequesterImportService();

    const [saveError, setSaveError] = useState<string>(null);

    const [initialValues] = useState<Record<string, string>>(() => {
        return Object.fromEntries(
            recordTypes.map(({ key }) => [
                key,
                row.records.find((record) => record.record_type_key === key)?.value || '',
            ]),
        );
    });

    const currentClientNumber = row.records.find((record) => record.record_type_key === 'client_number')?.value;
    const allowed = organization?.id === row.organization_id && canManageRequesterImports;

    const form = useFormBuilder(initialValues, async (values) => {
        if (!allowed) {
            form.setIsLocked(false);
            return;
        }

        const records = Object.fromEntries(
            Object.entries(values)
                .filter(
                    ([key, value]) =>
                        value.trim() !== initialValues[key] && (key !== 'client_number' || currentClientNumber == null),
                )
                .map(([key, value]) => [key, value.trim() || null]),
        );

        if (!Object.keys(records).length) {
            form.setIsLocked(false);
            return;
        }

        setSaveError(null);
        form.setErrors({});

        try {
            await requesterImportService.update(row.organization_id, row.id, records);
            onChanged();
            modal.close();
        } catch (error) {
            const response = error as ResponseError<ResponseError['data'] & { diagnostic_id?: string }>;
            form.setErrors(response.data?.errors || {});

            const reference = response.data?.diagnostic_id
                ? translate('requester_imports.diagnostic_reference', { reference: response.data.diagnostic_id })
                : null;

            setSaveError(
                [response.status !== 422 && translate('requester_imports.edit_save_failed'), reference]
                    .filter(Boolean)
                    .join(' ') || null,
            );

            if (response.status !== 422) {
                onChanged();
            }
        } finally {
            form.setIsLocked(false);
        }
    });

    const hasChanges = Object.entries(form.values).some(([key, value]) => value.trim() !== initialValues[key]);

    const closeModal = useCallback(() => {
        if (!form.isLocked) {
            modal.close();
        }
    }, [form.isLocked, modal]);

    useEffect(() => {
        if (!allowed) {
            closeModal();
        }
    }, [allowed, closeModal]);

    return (
        <Modal
            modal={{ ...modal, close: closeModal }}
            title={translate('requester_imports.edit_title')}
            onSubmit={form.submit}
            footer={
                <>
                    <button
                        className="button button-default"
                        type="button"
                        onClick={closeModal}
                        disabled={form.isLocked}>
                        {translate('requester_imports.buttons.cancel')}
                    </button>
                    <button
                        className="button button-primary"
                        type="submit"
                        disabled={!allowed || form.isLocked || !hasChanges}>
                        {translate('requester_imports.buttons.save')}
                    </button>
                </>
            }>
            <div className="flex flex-vertical flex-gap">
                <FormPane
                    title={translate('requester_imports.edit_panes.records')}
                    description={translate('requester_imports.edit_description')}>
                    {recordTypes
                        .filter(({ key }) => key !== 'client_number' || currentClientNumber == null)
                        .map((recordType) => (
                            <FormGroup
                                key={recordType.key}
                                label={recordType.name}
                                error={form.errors[`records.${recordType.key}`]}
                                hint={
                                    recordType.key === 'client_number'
                                        ? translate('requester_imports.edit_client_number_hint')
                                        : null
                                }
                                input={(id) => {
                                    const value = form.values[recordType.key];

                                    if (recordType.type === 'date') {
                                        return (
                                            <DatePickerControl
                                                id={id}
                                                value={dateParse(value)}
                                                disabled={form.isLocked}
                                                placeholder={recordType.name}
                                                onChange={(date) =>
                                                    form.update({ [recordType.key]: dateFormat(date) || '' })
                                                }
                                            />
                                        );
                                    }

                                    if (['bool', 'select', 'select_number'].includes(recordType.type)) {
                                        return (
                                            <SelectControl
                                                id={id}
                                                value={value}
                                                disabled={form.isLocked}
                                                propKey="value"
                                                options={[
                                                    { value: '', name: translate('requester_imports.empty_value') },
                                                    ...recordType.options,
                                                ]}
                                                onChange={(selected: string) =>
                                                    form.update({ [recordType.key]: selected ?? '' })
                                                }
                                            />
                                        );
                                    }

                                    return (
                                        <input
                                            id={id}
                                            className="form-control"
                                            type={
                                                recordType.type === 'number'
                                                    ? 'number'
                                                    : recordType.type === 'email'
                                                      ? 'email'
                                                      : 'text'
                                            }
                                            step={recordType.type === 'number' ? 'any' : undefined}
                                            value={value}
                                            disabled={form.isLocked}
                                            maxLength={400}
                                            onChange={(event) => form.update({ [recordType.key]: event.target.value })}
                                        />
                                    );
                                }}
                            />
                        ))}
                </FormPane>

                <FormPane title={translate('requester_imports.edit_panes.read_only')}>
                    <FormGroup
                        label={translate('requester_imports.labels.bsn')}
                        input={(id) => <input id={id} type="text" className="form-control" value={row.bsn} disabled />}
                    />
                    {currentClientNumber != null && (
                        <FormGroup
                            label={
                                recordTypes.find(({ key }) => key === 'client_number')?.name ||
                                translate('requester_imports.labels.client_number')
                            }
                            input={(id) => (
                                <input
                                    id={id}
                                    type="text"
                                    className="form-control"
                                    value={currentClientNumber}
                                    disabled
                                />
                            )}
                        />
                    )}
                </FormPane>

                <FormError error={form.errors.records} />
                <FormError error={saveError} />
            </div>
        </Modal>
    );
}
