let ProviderFundsComponent = function(
    $state,
    $stateParams,
    $filter,
) {
    let $ctrl = this;
    let $translate = $filter('translate');

    let trans_fund_provider = (key) => {
        return $translate('fund_card_provider.empty_block.' + key);
    };

    $ctrl.shownFundsType = $stateParams.fundsType || 'active';
    $ctrl.showEmptyBlock = false;

    $ctrl.$onInit = function() {
        let sort = {
            'pending': 0,
            'approved': 1,
            'declined': 2,
        };

        let is_pending_or_rejected = (fund) => {
            return !fund.allow_budget || fund.dismissed;
        }

        let is_closed = (fund) => {
            return fund.fund.state == 'closed';
        }

        $ctrl.shownFundsType = $stateParams.fundsType || 
            ($ctrl.funds.length ? 'active' : 'available');

        $ctrl.fundAvailableInvitations = $ctrl.fundInvitations.filter(
            fundInvitation => !fundInvitation.expired
        );

        $ctrl.archiveFunds = $ctrl.fundInvitations.filter(
            fundInvitation => fundInvitation.expired
        ).concat($ctrl.funds.filter(fund => {
            return is_closed(fund);
        }));

        $ctrl.pendingRejectedFunds = $ctrl.funds.filter(fund => {
            return is_pending_or_rejected(fund);
        });

        $ctrl.funds = $ctrl.funds.filter(fund => {
            return !is_pending_or_rejected(fund) && !is_closed(fund);
        });
        $ctrl.funds = $ctrl.funds.sort((a, b) => sort[a.state] - sort[b.state]);

        $ctrl.showEmptyBlock = $ctrl.checkForEmptyList($ctrl.shownFundsType);
        $ctrl.emptyBlockMsg  = $ctrl.getEmptyBlockMessage($ctrl.shownFundsType);
    };

    $ctrl.filterByFundStatus = (type) => {
        $ctrl.shownFundsType = type;
        $ctrl.showEmptyBlock = $ctrl.checkForEmptyList(type);
        $ctrl.emptyBlockMsg  = $ctrl.getEmptyBlockMessage(type);
    };

    $ctrl.checkForEmptyList = (type) => $ctrl.getActiveFundsCount(type) == 0;

    $ctrl.getActiveFundsCount = (type) => ({
        available: $ctrl.fundsAvailable.length,
        active: $ctrl.funds.length,
        invitations: $ctrl.fundAvailableInvitations.length,
        pending_rejected: $ctrl.pendingRejectedFunds.length,
        expired_closed: $ctrl.archiveFunds.length,
    }[type]);

    $ctrl.getEmptyBlockMessage = (type) => {
        return trans_fund_provider(type);
    };
};

module.exports = {
    bindings: {
        funds: '<',
        fundsAvailable: '<',
        fundInvitations: '<',
        fundLevel: '<',
        organization: '<',
    },
    controller: [
        '$state',
        '$stateParams',
        '$filter',
        ProviderFundsComponent
    ],
    templateUrl: 'assets/tpl/pages/provider-funds.html'
};