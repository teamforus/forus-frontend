import { BankAccountSource } from '../../../hooks/usePayoutBankAccounts';
import { PayoutBankAccountSourceField } from './types';

export const resetBankAccountIds = () => ({
    fund_request_id: null,
    profile_bank_account_id: null,
    reimbursement_id: null,
    payout_transaction_id: null,
});

export const BANK_ACCOUNT_SOURCE_FIELDS: Record<Exclude<BankAccountSource, 'manual'>, PayoutBankAccountSourceField> = {
    fund_request: 'fund_request_id',
    profile_bank_account: 'profile_bank_account_id',
    reimbursement: 'reimbursement_id',
    payout: 'payout_transaction_id',
};
