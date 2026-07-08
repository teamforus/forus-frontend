import { useCallback, useRef } from 'react';
import { ResponseError } from '../../dashboard/props/ApiResponses';
import Voucher from '../../dashboard/props/models/Voucher';
import usePushDanger from '../../dashboard/hooks/usePushDanger';
import usePushSuccess from '../../dashboard/hooks/usePushSuccess';
import useTranslate from '../../dashboard/hooks/useTranslate';
import Fund from '../props/models/Fund';
import { useFundService } from '../services/FundService';

type UseFundApplyOptions = {
    onApplied?: (voucher: Voucher, fund: Fund) => void;
    onError?: (err: ResponseError, fund: Fund) => void;
    showErrorPush?: boolean;
    showSuccessPush?: boolean;
};

export default function useFundApply({
    onApplied,
    onError,
    showErrorPush = true,
    showSuccessPush = true,
}: UseFundApplyOptions = {}) {
    const translate = useTranslate();

    const fundService = useFundService();

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();

    const optionsRef = useRef<UseFundApplyOptions>({});
    const applyingFund = useRef(false);

    optionsRef.current = { onApplied, onError, showErrorPush, showSuccessPush };

    return useCallback(
        (fund: Fund) => {
            if (applyingFund.current) {
                return;
            }

            applyingFund.current = true;

            fundService
                .apply(fund.id)
                .then(
                    (res) => {
                        const voucher = res.data.data;
                        const { onApplied, showSuccessPush } = optionsRef.current;

                        if (showSuccessPush) {
                            pushSuccess(
                                translate('push.success'),
                                translate('push.fund_activation.success', { fund_name: voucher?.fund?.name }),
                            );
                        }

                        onApplied?.(voucher, fund);
                    },
                    (err: ResponseError) => {
                        const { onError, showErrorPush } = optionsRef.current;

                        if (showErrorPush) {
                            pushDanger(translate('push.error'), err.data.message);
                        }

                        onError?.(err, fund);
                    },
                )
                .finally(() => {
                    applyingFund.current = false;
                });
        },
        [fundService, pushDanger, pushSuccess, translate],
    );
}
