import React, { Fragment, useCallback, useState } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import FundsListItemModel from '../../../../../services/types/FundsListItemModel';
import { WebshopRoutes } from '../../../../../modules/state_router/RouterBuilder';
import Label from '../../../label/Label';
import useAppConfigs from '../../../../../hooks/useAppConfigs';
import { useFundService } from '../../../../../services/FundService';
import { useNavigateState } from '../../../../../modules/state_router/Router';
import usePushDanger from '../../../../../../dashboard/hooks/usePushDanger';
import usePushSuccess from '../../../../../../dashboard/hooks/usePushSuccess';
import useShowTakenByPartnerModal from '../../../../../services/helpers/useShowTakenByPartnerModal';
import useFundMeta from '../../../../../hooks/meta/useFundMeta';
import Voucher from '../../../../../../dashboard/props/models/Voucher';
import Fund from '../../../../../props/models/Fund';
import PayoutTransaction from '../../../../../../dashboard/props/models/PayoutTransaction';

export default function FundsListItem({
    fund,
    funds,
    payouts,
    vouchers,
    forceShowImage = false,
}: {
    fund: Fund;
    funds: Array<Fund>;
    payouts: Array<PayoutTransaction>;
    vouchers: Array<Voucher>;
    forceShowImage: boolean;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const appConfigs = useAppConfigs();

    const fundService = useFundService();
    const navigateState = useNavigateState();

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const showTakenByPartnerModal = useShowTakenByPartnerModal();

    const [applyingFund, setApplyingFund] = useState(false);

    const fundMeta = useFundMeta(fund, payouts, vouchers, appConfigs);

    const onApplySuccess = useCallback(
        (vouchers: Voucher) => {
            pushSuccess(
                translate('push.success'),
                translate('push.fund_activation.success', { fund_name: vouchers?.fund?.name }),
            );

            if (funds.length === 1) {
                return navigateState(WebshopRoutes.VOUCHER, { number: vouchers.number });
            } else {
                document.location.reload();
            }
        },
        [funds.length, navigateState, pushSuccess, translate],
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
        <StateNavLink
            name={WebshopRoutes.FUND}
            params={{ id: fundMeta.id }}
            className={'fund-item'}
            dataDusk={`listFundsRow${fundMeta.id}`}
            dataAttributes={{ 'data-search-item': 1 }}>
            <div className="fund-content">
                {(appConfigs.show_fund_image_list || forceShowImage) && (
                    <div className="fund-photo">
                        <img
                            src={
                                fundMeta?.logo?.sizes?.thumbnail ||
                                fundMeta?.logo?.sizes?.small ||
                                assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                            }
                            alt=""
                        />
                    </div>
                )}

                <div className="fund-details">
                    <div className="fund-info">
                        <h2 className="fund-title">{fundMeta.name}</h2>

                        {fundMeta.description_short && (
                            <div className="fund-description">{fundMeta.description_short}</div>
                        )}
                    </div>

                    <div className="fund-actions">
                        {fundMeta.canApply && !fundMeta.showActivateButton && (
                            <Label type="light">{translate('list_blocks.fund_item_list.status.is_applicable')}</Label>
                        )}

                        {fundMeta.showActivateButton && (
                            <Label type="success">{translate('list_blocks.fund_item_list.status.activateable')}</Label>
                        )}

                        {fundMeta.alreadyReceived && (
                            <Label type="primary">{translate('list_blocks.fund_item_list.status.active')}</Label>
                        )}

                        {fundMeta.showPendingButton && (
                            <Label type="warning">{translate('list_blocks.fund_item_list.status.is_pending')}</Label>
                        )}

                        {fundMeta.showRequestButton && (
                            <Label type="light">{translate('list_blocks.fund_item_list.status.is_applicable')}</Label>
                        )}

                        <div>
                            {fundMeta.showActivateButton || fundMeta.showPendingButton ? (
                                <Fragment>
                                    {fundMeta.showActivateButton && (
                                        <button
                                            type="button"
                                            data-dusk="activateButton"
                                            className="button button-text fund-button-link"
                                            onClick={(e) => applyFund(e, fundMeta)}>
                                            {translate('list_blocks.fund_item_list.buttons.is_applicable')}
                                        </button>
                                    )}

                                    {fundMeta.showPendingButton && (
                                        <StateNavLink
                                            customElement={'button'}
                                            name={WebshopRoutes.FUND_REQUESTS}
                                            dataDusk="pendingButton"
                                            params={{ fund_id: fundMeta.id }}
                                            className="button button-text button-xs fund-button-link">
                                            {translate('list_blocks.fund_item_list.buttons.check_status')}
                                            <em className="mdi mdi-chevron-right icon-right" aria-hidden="true" />
                                        </StateNavLink>
                                    )}
                                </Fragment>
                            ) : (
                                <StateNavLink
                                    customElement={'button'}
                                    name={WebshopRoutes.FUND}
                                    params={{ id: fundMeta.id }}
                                    className="button button-text button-xs fund-button-link">
                                    {translate('list_blocks.fund_item_list.buttons.more_information')}
                                </StateNavLink>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StateNavLink>
    );
}
