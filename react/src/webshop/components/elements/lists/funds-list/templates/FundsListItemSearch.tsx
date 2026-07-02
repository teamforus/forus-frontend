import React, { Fragment, useCallback } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import FundsListItemModel from '../../../../../services/types/FundsListItemModel';
import Label from '../../../label/Label';
import useAppConfigs from '../../../../../hooks/useAppConfigs';
import useFundMeta from '../../../../../hooks/meta/useFundMeta';
import Voucher from '../../../../../../dashboard/props/models/Voucher';
import PayoutTransaction from '../../../../../../dashboard/props/models/PayoutTransaction';
import useApplyFund from '../hooks/useApplyFund';

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

    const appConfigs = useAppConfigs();
    const fundMeta = useFundMeta(fund, payouts, vouchers, appConfigs);

    const onApplySuccess = useCallback(() => {
        document.location.reload();
    }, []);

    const applyFund = useApplyFund({ onApplied: onApplySuccess });

    if (!fundMeta) {
        return null;
    }

    return (
        <Fragment>
            <div className="search-media">
                <img
                    src={
                        fundMeta.logo?.sizes?.thumbnail ||
                        fundMeta.logo?.sizes?.small ||
                        assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                    }
                    alt=""
                />
            </div>
            <div className="search-content">
                <div className="search-details">
                    <h2 className="search-title">{fundMeta.name}</h2>
                    <div className="search-subtitle">{fundMeta.organization?.name}</div>
                    <div className="search-status-label">
                        {fundMeta.showPendingButton && (
                            <Label type="default">{translate('list_blocks.fund_item_search.buttons.is_pending')}</Label>
                        )}

                        {fundMeta.alreadyReceived && (
                            <Label type="success">{translate('list_blocks.fund_item_search.status.active')}</Label>
                        )}
                    </div>
                </div>
                {fundMeta.showActivateButton && (
                    <div className="search-actions">
                        <button
                            className="button button-primary button-fill"
                            type="button"
                            onClick={(e) => applyFund(e, fundMeta)}>
                            {translate('list_blocks.fund_item_search.buttons.is_applicable')}
                        </button>
                    </div>
                )}
            </div>
        </Fragment>
    );
}
