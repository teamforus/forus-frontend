import { useEffect, useMemo, useState } from 'react';
import usePushApiError from './usePushApiError';
import { BankAccountSource, PayoutBankAccountOption } from './usePayoutBankAccounts';
import useLatestRequest from './useLatestRequest';
import { ResponseError } from '../props/ApiResponses';
import SponsorVoucher from '../props/models/Sponsor/SponsorVoucher';
import useVoucherService from '../services/VoucherService';
import { useHelperService } from '../services/HelperService';

export type PayoutBankAccountVoucherOption = {
    id: number;
    label: string;
    voucher: SponsorVoucher;
};

export type PayoutBankAccountVoucherStatus = 'idle' | 'loading' | 'empty' | 'single' | 'multiple';

type UsePayoutBankAccountVouchersParams = {
    organizationId?: number;
    fundId?: number;
    bankAccountSource?: BankAccountSource;
    bankAccount?: PayoutBankAccountOption;
    enabled?: boolean;
};

export default function usePayoutBankAccountVouchers({
    organizationId,
    fundId,
    bankAccountSource,
    bankAccount,
    enabled = true,
}: UsePayoutBankAccountVouchersParams) {
    const pushApiError = usePushApiError();
    const runLatestRequest = useLatestRequest();
    const voucherService = useVoucherService();
    const helperService = useHelperService();

    const [vouchers, setVouchers] = useState<Array<SponsorVoucher> | null>(null);
    const [voucherStatus, setVoucherStatus] = useState<PayoutBankAccountVoucherStatus>('idle');

    const voucherOptions = useMemo((): Array<PayoutBankAccountVoucherOption> => {
        return (vouchers || []).map((voucher) => {
            const requester = [voucher.identity_email, voucher.identity_bsn || voucher.relation_bsn]
                .filter(Boolean)
                .join(' / ');

            return {
                id: voucher.id,
                label: [
                    voucher.number && `#${voucher.number}`,
                    requester,
                    voucher.amount_available_locale,
                    voucher.expire_at_locale,
                ]
                    .filter(Boolean)
                    .join(' - '),
                voucher,
            };
        });
    }, [vouchers]);

    useEffect(() => {
        if (
            !enabled ||
            !organizationId ||
            !fundId ||
            !bankAccountSource ||
            bankAccountSource === 'manual' ||
            !bankAccount?.id ||
            !bankAccount.identity_id
        ) {
            runLatestRequest(() => Promise.resolve(null));
            setVouchers(null);
            setVoucherStatus('idle');
            return;
        }

        runLatestRequest(
            (config) =>
                helperService.recursiveLeach<SponsorVoucher>(
                    (page) =>
                        voucherService.index(
                            organizationId,
                            {
                                page,
                                per_page: 100,
                                fund_id: fundId,
                                identity_id: bankAccount.identity_id,
                                payout_eligible: 1,
                                type: 'all',
                                source: 'all',
                            },
                            config,
                        ),
                    4,
                ),
            {
                onStart: () => {
                    setVouchers(null);
                    setVoucherStatus('loading');
                },
                onSuccess: (vouchers) => {
                    setVouchers(vouchers);
                    setVoucherStatus(vouchers.length === 0 ? 'empty' : vouchers.length === 1 ? 'single' : 'multiple');
                },
                onError: (err: ResponseError) => {
                    setVouchers([]);
                    setVoucherStatus('empty');
                    pushApiError(err);
                },
            },
        );
    }, [
        bankAccount?.id,
        bankAccount?.identity_id,
        bankAccountSource,
        enabled,
        fundId,
        helperService,
        organizationId,
        pushApiError,
        runLatestRequest,
        voucherService,
    ]);

    return { voucherOptions, voucherStatus };
}
