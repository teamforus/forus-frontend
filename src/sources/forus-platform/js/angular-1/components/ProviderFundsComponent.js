let ProviderFundsComponent = function(
    $state,
    $stateParams,
    $filter,
) {
    let $ctrl = this;
    let $translate = $filter('translate');

    let trans_fund_provider = (key) => {
        return $translate('fund_card_provider.empty_block.' + key);
    }

    $ctrl.shownFundsType = $stateParams.fundsType || 'active';
    $ctrl.showEmptyBlock = false;

    $ctrl.$onInit = function() {
        let sort = {
            'pending': 0,
            'approved': 1,
            'declined': 2,
        };

        $ctrl.fundAvailableInvitations = $ctrl.fundInvitations.filter(
            fundInvitation => !fundInvitation.expired
        );

        $ctrl.fundExpiredInvitations = $ctrl.fundInvitations.filter(
            fundInvitation => fundInvitation.expired
        );

        $ctrl.funds = $ctrl.funds.sort((a, b) => sort[a.state] - sort[b.state]);

        $ctrl.showEmptyBlock = $ctrl.checkForEmptyList($ctrl.shownFundsType);
        $ctrl.emptyBlockMsg  = $ctrl.getEmptyBlockMessage($ctrl.shownFundsType);
    };

    $ctrl.filterByFundStatus = (type) => {
        $ctrl.shownFundsType = type;
        $ctrl.showEmptyBlock = $ctrl.checkForEmptyList(type);
        $ctrl.emptyBlockMsg  = $ctrl.getEmptyBlockMessage(type);
    };

    $ctrl.checkForEmptyList = (type) => ({
        available: $ctrl.fundsAvailable.length == 0,
        active: $ctrl.funds.length == 0,
        invitations: $ctrl.fundAvailableInvitations.length == 0,
        invitations_expired: $ctrl.fundExpiredInvitations.length == 0,
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