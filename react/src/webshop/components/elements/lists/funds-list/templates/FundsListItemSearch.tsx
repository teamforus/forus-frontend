import React, { Fragment, useCallback } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import FundsListItemModel from '../../../../../services/types/FundsListItemModel';
import Label from '../../../label/Label';
import useAppConfigs from '../../../../../hooks/useAppConfigs';
import { useFundService } from '../../../../../services/FundService';
import usePushDanger from '../../../../../../dashboard/hooks/usePushDanger';
import usePushSuccess from '../../../../../../dashboard/hooks/usePushSuccess';
import useShowTakenByPartnerModal from '../../../../../services/helpers/useShowTakenByPartnerModal';
import useFundMeta from '../../../../../hooks/meta/useFundMeta';
import Voucher from '../../../../../../dashboard/props/models/Voucher';
import PayoutTransaction from '../../../../../../dashboard/props/models/PayoutTransaction';

export default function FundsListItemSearch({
    fund,
    payouts,
    vouchers,
}: {
    fund?: FundsListItemModel;
    payouts: Array<PayoutTransaction>;
    vouchers: Array<Voucher>;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    const [applyingFund, setApplyingFund] = React.useState(false);
    const appConfigs = useAppConfigs();

    const fundService = useFundService();

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const showTakenByPartnerModal = useShowTakenByPartnerModal();

    const fundMeta = useFundMeta(fund, payouts, vouchers, appConfigs);

    const onApplySuccess = useCallback(
        (vouchers: Voucher) => {
            pushSuccess(
                translate('push.success'),
                translate('push.fund_activation.success', { fund_name: vouchers?.fund?.name }),
            );

            document.location.reload();
        },
        [pushSuccess, translate],
    );

    const applyFund = useCallback(
        function (e: React.MouseEvent, fund: FundsListItemModel) {
            e.stopPropagation();
            e.preventDefault();

            if (applyingFund) {
                return;
            }

            if (fund.taken_by_partner) {
                return showTakenByPartnerModal();
            }

            setApplyingFund(true);

            fundService
                .apply(fund.id)
                .then(
                    (res) => onApplySuccess(res.data.data),
                    (res) => pushDanger(translate('push.error'), res.data.message),
                )
                .finally(() => setApplyingFund(false));
        },
        [applyingFund, fundService, onApplySuccess, pushDanger, showTakenByPartnerModal, translate],
    );

    if (!fundMeta) {
        return null;
    }

    return (
        <Fragment>
            <div className="search-media">
                <img
                    src={
                        fund?.logo?.sizes?.thumbnail ||
                        fund?.logo?.sizes?.small ||
                        assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                    }
                    alt=""
                />
            </div>
            <div className="search-content">
                <div className="search-details">
                    <h2 className="search-title">{fund.name}</h2>
                    <div className="search-subtitle">{fund.organization?.name}</div>
                    <div className="search-status-label">
                        {fund.showPendingButton && (
                            <Label type="default">{translate('list_blocks.fund_item_search.buttons.is_pending')}</Label>
                        )}

                        {fund.alreadyReceived && (
                            <Label type="success">{translate('list_blocks.fund_item_search.status.active')}</Label>
                        )}
                    </div>
                </div>
                {fund.showActivateButton && (
                    <div className="search-actions">
                        <button
                            className="button button-primary button-fill"
                            type="button"
                            onClick={(e) => applyFund(e, fund)}>
                            {translate('list_blocks.fund_item_search.buttons.is_applicable')}
                        </button>
                    </div>
                )}
            </div>
        </Fragment>
    );
}
