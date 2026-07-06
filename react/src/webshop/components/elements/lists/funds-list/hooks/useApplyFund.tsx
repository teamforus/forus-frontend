import React, { useCallback } from 'react';
import Voucher from '../../../../../../dashboard/props/models/Voucher';
import useFundApply from '../../../../../hooks/useFundApply';
import useShowTakenByPartnerModal from '../../../../../services/helpers/useShowTakenByPartnerModal';
import FundsListItemModel from '../../../../../services/types/FundsListItemModel';

export default function useApplyFund({ onApplied }: { onApplied: (voucher: Voucher) => void }) {
    const applyFund = useFundApply({ onApplied });
    const showTakenByPartnerModal = useShowTakenByPartnerModal();

    return useCallback(
        function (e: React.MouseEvent, fund: FundsListItemModel) {
            e.stopPropagation();
            e.preventDefault();

            if (fund.taken_by_partner) {
                return showTakenByPartnerModal();
            }

            applyFund(fund);
        },
        [applyFund, showTakenByPartnerModal],
    );
}
