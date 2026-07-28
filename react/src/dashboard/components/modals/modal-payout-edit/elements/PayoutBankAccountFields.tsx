import React, { Dispatch, SetStateAction, useEffect, useMemo, useRef } from 'react';
import Fund from '../../../../props/models/Fund';
import FormBuilder from '../../../../types/FormBuilder';
import Organization, { Permission } from '../../../../props/models/Organization';
import useTranslate from '../../../../hooks/useTranslate';
import usePayoutBankAccounts, { BankAccountSource } from '../../../../hooks/usePayoutBankAccounts';
import usePayoutBankAccountVouchers from '../../../../hooks/usePayoutBankAccountVouchers';
import { hasPermission } from '../../../../helpers/utils';
import FormGroup from '../../../elements/forms/elements/FormGroup';
import SelectControl from '../../../elements/select-control/SelectControl';
import { BANK_ACCOUNT_SOURCE_FIELDS, resetBankAccountIds } from '../helpers';
import { PayoutFormValues, PayoutFundingType } from '../types';

export default function PayoutBankAccountFields({
    form,
    fund,
    organization,
    isEditing,
    bankAccountSource,
    setBankAccountSource,
}: {
    form: FormBuilder<PayoutFormValues>;
    fund?: Partial<Fund>;
    organization: Organization;
    isEditing: boolean;
    bankAccountSource: BankAccountSource;
    setBankAccountSource: Dispatch<SetStateAction<BankAccountSource>>;
}) {
    const translate = useTranslate();

    const fundingTypeOptions = useMemo(
        () => [
            {
                key: 'voucher',
                label: translate('modals.modal_payout_create.options.funding_type_voucher'),
            },
            {
                key: 'standalone',
                label: translate('modals.modal_payout_create.options.funding_type_standalone'),
            },
        ],
        [translate],
    );

    const bankAccountSourceOptions = useMemo(() => {
        return [
            {
                key: 'manual',
                label: translate('modals.modal_payout_create.options.bank_account_source_manual'),
            },
            {
                key: 'fund_request',
                label: translate('modals.modal_payout_create.options.bank_account_source_fund_request'),
            },
            {
                key: 'profile_bank_account',
                label: translate('modals.modal_payout_create.options.bank_account_source_profile_bank_account'),
            },
            {
                key: 'reimbursement',
                label: translate('modals.modal_payout_create.options.bank_account_source_reimbursement'),
            },
            {
                key: 'payout',
                label: translate('modals.modal_payout_create.options.bank_account_source_payout'),
            },
        ];
    }, [translate]);

    const canUseVoucherFunding =
        !isEditing && hasPermission(organization, [Permission.MANAGE_VOUCHERS, Permission.VIEW_VOUCHERS]);

    const { bankAccountsLoading, bankAccountOptions } = usePayoutBankAccounts({
        organizationId: organization?.id,
        fundId: fund?.id,
        bankAccountSource,
        enabled: !isEditing,
        placeholderLabel: translate('modals.modal_payout_create.options.bank_account_select_placeholder'),
    });

    const selectedBankAccount =
        bankAccountSource === 'manual'
            ? null
            : bankAccountOptions.find(
                  (option) => option.id === form.values[BANK_ACCOUNT_SOURCE_FIELDS[bankAccountSource]],
              );

    const { voucherOptions, voucherStatus } = usePayoutBankAccountVouchers({
        organizationId: organization?.id,
        fundId: fund?.id,
        bankAccountSource,
        bankAccount: selectedBankAccount,
        enabled: canUseVoucherFunding && form.values.funding_type === 'voucher',
    });

    const updateForm = form.update;
    const previousVoucherStatus = useRef(voucherStatus);

    useEffect(() => {
        const voucher = voucherOptions[0];

        const shouldSelectVoucher =
            previousVoucherStatus.current === 'loading' &&
            voucherStatus === 'single' &&
            voucher?.voucher.fund_id === fund?.id &&
            voucher?.voucher.identity_id === selectedBankAccount?.identity_id;

        previousVoucherStatus.current = voucherStatus;

        if (shouldSelectVoucher && voucher.id !== form.values.voucher_id) {
            updateForm({ voucher_id: voucher.id });
        }
    }, [form.values.voucher_id, fund?.id, selectedBankAccount?.identity_id, updateForm, voucherOptions, voucherStatus]);

    return (
        <>
            {!isEditing && (
                <FormGroup
                    required={true}
                    label={translate('modals.modal_payout_create.labels.bank_account_source')}
                    info={translate('modals.modal_payout_create.info.bank_account_source')}
                    input={(id) => (
                        <SelectControl
                            id={id}
                            value={bankAccountSource}
                            propKey={'key'}
                            propValue={'label'}
                            dusk="payoutBankAccountSourceSelect"
                            onChange={(value: BankAccountSource) => {
                                setBankAccountSource(value);
                                form.update({
                                    funding_type: value === 'manual' ? 'standalone' : form.values.funding_type,
                                    voucher_id: null,
                                    ...resetBankAccountIds(),
                                    target_iban: '',
                                    target_name: '',
                                });
                            }}
                            options={bankAccountSourceOptions}
                            allowSearch={false}
                        />
                    )}
                />
            )}

            {canUseVoucherFunding && (
                <FormGroup
                    required={true}
                    label={translate('modals.modal_payout_create.labels.funding_type')}
                    info={translate('modals.modal_payout_create.info.funding_type')}
                    hint={
                        bankAccountSource === 'manual'
                            ? translate('modals.modal_payout_create.info.funding_type_manual')
                            : form.values.funding_type === 'standalone'
                              ? translate('modals.modal_payout_create.info.funding_type_standalone')
                              : undefined
                    }
                    input={(id) => (
                        <SelectControl
                            id={id}
                            value={form.values.funding_type}
                            propKey={'key'}
                            propValue={'label'}
                            dusk="payoutFundingTypeSelect"
                            onChange={(funding_type: PayoutFundingType) =>
                                form.update({ funding_type, voucher_id: null })
                            }
                            options={fundingTypeOptions}
                            allowSearch={false}
                            disabled={bankAccountSource === 'manual'}
                        />
                    )}
                    error={form.errors?.funding_type}
                />
            )}

            {!isEditing && bankAccountSource !== 'manual' && (
                <FormGroup
                    required={true}
                    label={translate('modals.modal_payout_create.labels.bank_account')}
                    info={translate('modals.modal_payout_create.info.bank_account')}
                    input={(id) => (
                        <SelectControl
                            key={`payout-bank-account-${fund?.id}-${bankAccountSource}`}
                            id={id}
                            value={form.values[BANK_ACCOUNT_SOURCE_FIELDS[bankAccountSource]] || null}
                            propKey={'id'}
                            propValue={'label'}
                            dusk="payoutBankAccountSelect"
                            onChange={(bank_account_id: number) => {
                                const selected = bankAccountOptions.find((option) => option.id === bank_account_id);

                                const updateData: {
                                    fund_request_id?: number | null;
                                    profile_bank_account_id?: number | null;
                                    reimbursement_id?: number | null;
                                    payout_transaction_id?: number | null;
                                    voucher_id?: number;
                                    target_iban: string;
                                    target_name: string;
                                } = {
                                    voucher_id: null,
                                    ...resetBankAccountIds(),
                                    target_iban: selected?.iban || '',
                                    target_name: selected?.iban_name || '',
                                    [BANK_ACCOUNT_SOURCE_FIELDS[bankAccountSource]]: bank_account_id,
                                };

                                form.update(updateData);
                            }}
                            options={bankAccountOptions}
                            allowSearch={true}
                            disabled={bankAccountsLoading}
                        />
                    )}
                    error={
                        form.errors?.fund_request_id ||
                        form.errors?.profile_bank_account_id ||
                        form.errors?.reimbursement_id ||
                        form.errors?.payout_transaction_id
                    }
                />
            )}

            {!isEditing && form.values.funding_type === 'voucher' && (
                <FormGroup
                    required={true}
                    label={translate('modals.modal_payout_create.labels.voucher')}
                    info={translate('modals.modal_payout_create.info.voucher')}
                    input={(id) => (
                        <SelectControl
                            key={`payout-voucher-${fund?.id}-${bankAccountSource}-${selectedBankAccount?.id || 'none'}`}
                            id={id}
                            value={form.values.voucher_id}
                            propKey={'id'}
                            propValue={'label'}
                            dusk="payoutVoucherSelect"
                            placeholder={
                                voucherStatus === 'loading'
                                    ? translate('modals.modal_payout_create.options.voucher_select_loading')
                                    : voucherStatus === 'empty'
                                      ? translate('modals.modal_payout_create.options.voucher_select_empty')
                                      : voucherStatus === 'idle'
                                        ? translate('modals.modal_payout_create.options.voucher_select_bank_first')
                                        : translate('modals.modal_payout_create.options.voucher_select_placeholder')
                            }
                            onChange={(voucher_id: number) => form.update({ voucher_id })}
                            options={voucherOptions}
                            allowSearch={voucherStatus === 'multiple'}
                            disabled={voucherStatus !== 'multiple'}
                        />
                    )}
                    error={form.errors?.voucher_id}
                />
            )}

            <FormGroup
                required={bankAccountSource === 'manual'}
                label={translate('modals.modal_payout_create.labels.iban')}
                info={translate('modals.modal_payout_create.info.iban')}
                input={(id) => (
                    <input
                        id={id}
                        className="form-control"
                        placeholder={translate('modals.modal_payout_create.labels.iban')}
                        data-dusk="payoutTargetIban"
                        value={form.values.target_iban || ''}
                        disabled={!isEditing && bankAccountSource !== 'manual'}
                        onChange={(e) => form.update({ target_iban: e.target.value })}
                    />
                )}
                error={form.errors?.target_iban}
            />

            <FormGroup
                required={bankAccountSource === 'manual'}
                label={translate('modals.modal_payout_create.labels.iban_name')}
                info={translate('modals.modal_payout_create.info.iban_name')}
                input={(id) => (
                    <input
                        id={id}
                        className="form-control"
                        placeholder={translate('modals.modal_payout_create.labels.iban_name')}
                        data-dusk="payoutTargetName"
                        value={form.values.target_name || ''}
                        disabled={!isEditing && bankAccountSource !== 'manual'}
                        onChange={(e) => form.update({ target_name: e.target.value })}
                    />
                )}
                error={form.errors?.target_name}
            />
        </>
    );
}
