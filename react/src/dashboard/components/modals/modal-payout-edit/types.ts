export type PayoutAmountType = 'custom' | 'predefined';
export type PayoutFundingType = 'standalone' | 'voucher';

export type PayoutFormValues = {
    target_iban: string;
    target_name: string;
    amount?: string;
    amount_preset_id?: number;
    allocate_by: PayoutAmountType;
    funding_type: PayoutFundingType;
    voucher_id?: number;
    description: string;
    email: string;
    bsn: string;
    fund_request_id?: number;
    profile_bank_account_id?: number;
    reimbursement_id?: number;
    payout_transaction_id?: number;
};

export type PayoutBankAccountSourceField =
    | 'fund_request_id'
    | 'profile_bank_account_id'
    | 'reimbursement_id'
    | 'payout_transaction_id';
