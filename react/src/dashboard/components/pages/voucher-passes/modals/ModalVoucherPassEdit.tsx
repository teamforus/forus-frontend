import React, { useCallback, useEffect, useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import useCanManageVoucherPasses from '../../../../hooks/permissions/useCanManageVoucherPasses';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import useLatestRequest from '../../../../hooks/useLatestRequest';
import usePushApiError from '../../../../hooks/usePushApiError';
import { useVoucherPassService } from '../../../../services/VoucherPassService';
import { useFundService } from '../../../../services/FundService';
import { useHelperService } from '../../../../services/HelperService';
import VoucherPass, { VoucherPassConfiguration, VoucherPassInput } from '../../../../props/models/VoucherPass';
import Fund from '../../../../props/models/Fund';
import { ResponseError } from '../../../../props/ApiResponses';
import { ModalState } from '../../../../modules/modals/context/ModalContext';
import { normalizeBsn } from '../../../../helpers/string';
import Modal from '../../../modals/elements/Modal';
import FormPane from '../../../elements/forms/elements/FormPane';
import FormGroup from '../../../elements/forms/elements/FormGroup';
import FormError from '../../../elements/forms/errors/FormError';
import MultiSelectControl from '../../../elements/forms/controls/MultiSelectControl';
import CheckboxControl from '../../../elements/forms/controls/CheckboxControl';
import SelectControl from '../../../elements/select-control/SelectControl';

export default function ModalVoucherPassEdit({
    modal,
    pass,
    onChanged,
}: {
    modal: ModalState;
    pass: VoucherPass;
    onChanged: () => void;
}) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const organization = useActiveOrganization();
    const runRequest = useLatestRequest();
    const canManage = useCanManageVoucherPasses();

    const fundService = useFundService();
    const passService = useVoucherPassService();
    const helperService = useHelperService();

    const [funds, setFunds] = useState<Fund[]>([]);
    const [configuration, setConfiguration] = useState<VoucherPassConfiguration>(null);

    const allowed = canManage && organization?.id === pass.organization_id;

    const form = useFormBuilder<VoucherPassInput>(
        {
            external_id: pass.external_id || '',
            owner_bsn: pass.owner_bsn,
            target_bsn: pass.target_bsn,
            type_names: pass.types.map((type) => type.name),
            fund_ids: [...pass.fund_ids],
            print_label: pass.print_label || '',
            state: pass.state,
            print_requested: pass.print_requested,
        },
        (values) => {
            if (!allowed || !configuration) {
                form.setIsLocked(false);
                return;
            }

            form.setErrors({});

            return passService
                .update(pass.organization_id, pass.id, {
                    ...values,
                    owner_bsn: pass.owner_bsn,
                    target_bsn: normalizeBsn(values.target_bsn.trim()),
                    external_id: pass.external_id ?? (values.external_id.trim() || null),
                    print_label: values.print_label.trim(),
                })
                .then(
                    () => {
                        onChanged();
                        modal.close();
                    },
                    (error: ResponseError) => {
                        form.setErrors(error.data?.errors || {});

                        if (error.status !== 422) {
                            pushApiError(error);
                        }
                    },
                )
                .finally(() => form.setIsLocked(false));
        },
    );

    const close = useCallback(() => {
        if (!form.isLocked) {
            modal.close();
        }
    }, [form.isLocked, modal]);

    useEffect(() => {
        if (!allowed) {
            close();
        }
    }, [allowed, close]);

    useEffect(() => {
        if (!allowed) {
            return;
        }

        runRequest(
            (config) =>
                Promise.all([
                    passService.configs(pass.organization_id, config),
                    helperService.recursiveLeach<Fund>((page) =>
                        fundService.list(
                            pass.organization_id,
                            { page, per_page: 100, with_archived: 1, with_external: 1 },
                            config,
                        ),
                    ),
                ]),
            {
                onSuccess: ([response, funds]) => {
                    setConfiguration(response.data.data);
                    setFunds(funds);
                },
                onError: pushApiError,
            },
        );
    }, [allowed, fundService, helperService, pass.organization_id, passService, pushApiError, runRequest]);

    return (
        <Modal
            modal={{ ...modal, close }}
            title={translate('voucher_passes.edit_title')}
            onSubmit={form.submit}
            processing={form.isLocked}
            footer={
                <>
                    <button type="button" className="button button-default" disabled={form.isLocked} onClick={close}>
                        {translate('voucher_passes.buttons.cancel')}
                    </button>

                    <button
                        type="submit"
                        className="button button-primary"
                        disabled={!allowed || !configuration || form.isLocked}>
                        {translate('voucher_passes.buttons.save')}
                    </button>
                </>
            }>
            {configuration && (
                <div className="flex flex-vertical flex-gap">
                    <FormPane title={translate('voucher_passes.details')}>
                        {(['external_id', 'target_bsn', 'print_label'] as const).map((field) => (
                            <FormGroup
                                key={field}
                                label={translate(`voucher_passes.fields.${field}`)}
                                error={form.errors[field]}
                                required={field === 'target_bsn'}
                                hint={field === 'external_id' ? translate('voucher_passes.uid_hint') : null}
                                input={(id) => (
                                    <input
                                        id={id}
                                        className="form-control"
                                        value={form.values[field]}
                                        maxLength={field === 'target_bsn' ? 9 : 200}
                                        disabled={
                                            form.isLocked || (field === 'external_id' && pass.external_id !== null)
                                        }
                                        onChange={(event) => form.update({ [field]: event.target.value })}
                                    />
                                )}
                            />
                        ))}

                        <div inert={form.isLocked}>
                            <MultiSelectControl<string>
                                label={translate('voucher_passes.fields.type_names')}
                                placeholder={translate('voucher_passes.select')}
                                value={form.values.type_names}
                                options={configuration.types.map((type) => ({ id: type.name, name: type.name }))}
                                onChange={(value) => form.update({ type_names: value })}
                            />
                            <FormError
                                error={Object.entries(form.errors)
                                    .filter(([key]) => key === 'type_names' || key.startsWith('type_names.'))
                                    .flatMap(([, messages]) => messages)}
                            />
                        </div>

                        <div inert={form.isLocked}>
                            <MultiSelectControl
                                label={translate('voucher_passes.fields.fund_ids')}
                                placeholder={translate('voucher_passes.select')}
                                value={form.values.fund_ids}
                                options={funds.map((fund) => ({ id: fund.id, name: `#${fund.id} ${fund.name}` }))}
                                onChange={(value) => form.update({ fund_ids: value })}
                            />
                            <div className="form-hint">{translate('voucher_passes.fund_hint')}</div>
                            <FormError
                                error={Object.entries(form.errors)
                                    .filter(([key]) => key === 'fund_ids' || key.startsWith('fund_ids.'))
                                    .flatMap(([, messages]) => messages)}
                            />
                        </div>

                        <FormGroup
                            label={translate('voucher_passes.fields.state')}
                            error={form.errors.state}
                            input={(id) => (
                                <SelectControl
                                    id={id}
                                    value={form.values.state}
                                    propKey="value"
                                    disabled={form.isLocked}
                                    options={['active', 'deactivated'].map((value) => ({
                                        value,
                                        name: translate(`voucher_passes.${value}`),
                                    }))}
                                    onChange={(value: VoucherPassInput['state']) => form.update({ state: value })}
                                />
                            )}
                        />

                        <CheckboxControl
                            checked={form.values.print_requested}
                            disabled={form.isLocked}
                            title={translate('voucher_passes.fields.print_requested')}
                            onChange={(_, checked) => form.update({ print_requested: checked })}
                        />
                        <FormError error={form.errors.print_requested} />
                    </FormPane>

                    <FormPane title={translate('voucher_passes.read_only')}>
                        {(['owner_bsn', 'code'] as const).map((field) => (
                            <FormGroup
                                key={field}
                                label={translate(`voucher_passes.fields.${field}`)}
                                error={form.errors[field]}
                                input={(id) => <input id={id} className="form-control" value={pass[field]} disabled />}
                            />
                        ))}
                    </FormPane>
                </div>
            )}
        </Modal>
    );
}
