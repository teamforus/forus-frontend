import React from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import PayoutTransaction from '../../../../../dashboard/props/models/PayoutTransaction';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';
import Fund from '../../../../props/models/Fund';
import FundsListItemSearch from './templates/FundsListItemSearch';

export default function FundsSearchListItem({
    fund,
    payouts,
    vouchers,
    stateParams = null,
}: {
    fund: Fund;
    payouts: Array<PayoutTransaction>;
    vouchers: Array<Voucher>;
    stateParams?: object;
}) {
    return (
        <StateNavLink
            name={WebshopRoutes.FUND}
            params={{ id: fund.id }}
            state={stateParams || null}
            className={'search-item search-item-fund'}
            dataDusk={`listFundsRow${fund.id}`}
            dataAttributes={{ 'data-search-item': 1 }}>
            <FundsListItemSearch fund={fund} vouchers={vouchers} payouts={payouts} />
        </StateNavLink>
    );
}
