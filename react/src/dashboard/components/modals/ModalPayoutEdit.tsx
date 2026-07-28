import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import Fund from '../../props/models/Fund';
import SelectControl from '../elements/select-control/SelectControl';
import useTranslate from '../../hooks/useTranslate';
import Organization from '../../props/models/Organization';
import { ResponseError } from '../../props/ApiResponses';
import useSetProgress from '../../hooks/useSetProgress';
import SelectControlOptionsFund from '../elements/select-control/templates/SelectControlOptionsFund';
import FormGroup from '../elements/forms/elements/FormGroup';
import FormPane from '../elements/forms/elements/FormPane';
import FormPaneContainer from '../elements/forms/elements/FormPaneContainer';
import usePushApiError from '../../hooks/usePushApiError';
import usePayoutTransactionService from '../../services/PayoutTransactionService';
import PayoutTransaction from '../../props/models/PayoutTransaction';
import { BankAccountSource } from '../../hooks/usePayoutBankAccounts';
import PayoutAmountFields from './modal-payout-edit/elements/PayoutAmountFields';
import PayoutBankAccountFields from './modal-payout-edit/elements/PayoutBankAccountFields';
import { BANK_ACCOUNT_SOURCE_FIELDS, resetBankAccountIds } from './modal-payout-edit/helpers';
import { PayoutAmountType, PayoutFormValues } from './modal-payout-edit/types';

export default function ModalPayoutEdit({
    funds,
    modal,
    className,
    onCreated,
    onUpdated,
    transaction,
    organization,
}: {
    funds: Array<Partial<Fund>>;
    modal: ModalState;
    className?: string;
    onCreated?: () => void;
    onUpdated?: () => void;
    transaction?: PayoutTransaction;
    organization: Organization;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const payoutTransactionService = usePayoutTransactionService();

    const [fund, setFund] = useState(
        transaction ? funds?.find((fund) => fund.id === transaction?.fund?.id) : funds?.[0],
    );
    const [bankAccountSource, setBankAccountSource] = useState<BankAccountSource>('manual');

    const assignTypes = useMemo(() => {
        if (transaction) {
            return [];
        }

        return [
            { key: null, label: 'Geen', inputLabel: 'E-mailadres', hasInput: false },
            { key: 'email', label: 'E-mailadres', inputLabel: 'E-mailadres', hasInput: true },
            ...(organization?.bsn_enabled ? [{ key: 'bsn', label: 'BSN', inputLabel: 'BSN', hasInput: true }] : []),
        ];
    }, [transaction, organization?.bsn_enabled]);

    const [assignType, setAssignType] = useState(assignTypes?.[0]);

    const getDefaultAllocateBy = (fund: Partial<Fund> | undefined): PayoutAmountType => {
        if (fund?.allow_custom_amounts) {
            return 'custom';
        }

        if (fund?.allow_preset_amounts && fund?.amount_presets?.length > 0) {
            return 'predefined';
        }

        return 'custom';
    };

    const form = useFormBuilder<PayoutFormValues>(
        {
            amount: transaction?.amount || '',
            target_iban: transaction?.iban_to || '',
            target_name: transaction?.iban_to_name || '',
            allocate_by: transaction
                ? transaction?.amount_preset_id
                    ? 'predefined'
                    : 'custom'
                : getDefaultAllocateBy(fund),
            amount_preset_id: transaction?.amount_preset_id || fund?.amount_presets?.[0]?.id,
            funding_type: 'standalone',
            voucher_id: null,
            description: transaction?.description || '',
            email: '',
            bsn: '',
            ...resetBankAccountIds(),
        },
        (values) => {
            setProgress(0);

            const getBankAccountData = () => {
                if (bankAccountSource !== 'manual') {
                    const fieldName = BANK_ACCOUNT_SOURCE_FIELDS[bankAccountSource];
                    const fieldValue = values[fieldName];
                    if (fieldValue) {
                        return { [fieldName]: fieldValue };
                    }
                }
                return {
                    target_iban: values.target_iban,
                    target_name: values.target_name,
                };
            };

            const data = {
                description: values.description,
                ...getBankAccountData(),
                amount: values.allocate_by === 'custom' ? values.amount : undefined,
                amount_preset_id: values.allocate_by === 'predefined' ? values.amount_preset_id : undefined,
                ...{
                    email: { email: values.email || '-' },
                    bsn: { bsn: values.bsn || '-' },
                    null: {},
                }[assignType?.key],
            };

            const promise = transaction
                ? payoutTransactionService.update(organization.id, transaction.address, data)
                : payoutTransactionService.store(organization.id, {
                      fund_id: fund?.id,
                      funding_type: values.funding_type,
                      voucher_id: values.funding_type === 'voucher' ? values.voucher_id : undefined,
                      ...data,
                  });

            promise
                .then(() => {
                    if (transaction) {
                        onUpdated?.();
                    } else {
                        onCreated?.();
                    }

                    modal.close();
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data.errors);
                    pushApiError(err);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    return (
        <div
            className={classNames(
                'modal',
                'modal-animated',
                'modal-voucher-create',
                modal.loading && 'modal-loading',
                className,
            )}
            data-dusk="payoutCreateModal">
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">{translate('modals.modal_payout_create.title')}</div>

                <div className="modal-body">
                    <div className="modal-section">
                        <FormPaneContainer>
                            <FormPane title={translate('modals.modal_payout_create.sections.payout_details')}>
                                <FormGroup
                                    required={true}
                                    label={translate('modals.modal_payout_create.labels.fund')}
                                    info={translate('modals.modal_payout_create.info.fund')}
                                    input={(id) => (
                                        <SelectControl
                                            id={id}
                                            value={fund}
                                            propValue={'name'}
                                            disabled={!!transaction?.id}
                                            onChange={(fund: Fund) => {
                                                setFund(fund);
                                                form.update({
                                                    allocate_by: getDefaultAllocateBy(fund),
                                                    amount_preset_id: fund?.amount_presets?.[0]?.id,
                                                    voucher_id: null,
                                                    ...resetBankAccountIds(),
                                                    target_iban: '',
                                                    target_name: '',
                                                });
                                            }}
                                            options={funds}
                                            allowSearch={false}
                                            optionsComponent={SelectControlOptionsFund}
                                        />
                                    )}
                                    error={form.errors?.fund_id}
                                />

                                <PayoutAmountFields form={form} fund={fund} />

                                {assignTypes.length > 0 && (
                                    <FormGroup
                                        required={true}
                                        label={translate('modals.modal_payout_create.labels.assign_by_type')}
                                        info={translate('modals.modal_payout_create.info.assign_by_type')}
                                        input={(id) => (
                                            <SelectControl
                                                id={id}
                                                value={assignType}
                                                propValue={'label'}
                                                onChange={setAssignType}
                                                options={assignTypes}
                                                allowSearch={false}
                                            />
                                        )}
                                    />
                                )}

                                {assignType?.hasInput && (
                                    <FormGroup
                                        required={true}
                                        label={assignType.inputLabel}
                                        info={
                                            assignType.key === 'email'
                                                ? translate('modals.modal_payout_create.info.email')
                                                : assignType.key === 'bsn'
                                                  ? translate('modals.modal_payout_create.info.bsn')
                                                  : undefined
                                        }
                                        input={(id) => (
                                            <input
                                                id={id}
                                                className="form-control"
                                                placeholder={assignType.inputLabel}
                                                value={form.values[assignType.key] || ''}
                                                onChange={(e) => form.update({ [assignType.key]: e.target.value })}
                                            />
                                        )}
                                        error={form.errors?.[assignType?.key]}
                                    />
                                )}
                            </FormPane>

                            <FormPane title={translate('modals.modal_payout_create.sections.payment_details')}>
                                <PayoutBankAccountFields
                                    form={form}
                                    fund={fund}
                                    organization={organization}
                                    isEditing={!!transaction}
                                    bankAccountSource={bankAccountSource}
                                    setBankAccountSource={setBankAccountSource}
                                />

                                <FormGroup
                                    label={translate('modals.modal_payout_create.labels.description')}
                                    info={translate('modals.modal_payout_create.info.description')}
                                    input={(id) => (
                                        <textarea
                                            id={id}
                                            className="form-control r-n"
                                            placeholder={translate('modals.modal_payout_create.labels.description')}
                                            value={form.values.description || ''}
                                            onChange={(e) => form.update({ description: e.target.value })}
                                        />
                                    )}
                                    error={form.errors?.description}
                                />
                            </FormPane>
                        </FormPaneContainer>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        {translate('modals.modal_payout_create.buttons.cancel')}
                    </button>

                    <button
                        type="submit"
                        className="button button-primary"
                        data-dusk="payoutSubmit"
                        disabled={form.values.funding_type === 'voucher' && !form.values.voucher_id}>
                        {translate('modals.modal_payout_create.buttons.submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}
