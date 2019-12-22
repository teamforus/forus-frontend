let ProviderFundsComponent = function(
    $state,
    $stateParams,
    $filter,
) {
    let $ctrl = this;
    let $translate = $filter('translate');

    let trans_fund_provider = (key) => {
        return $translate('fund_card_provider.labels.' + key);
    }

    $ctrl.shownFundsType = $stateParams.fundsType || 'active';
    $ctrl.showEmptyBlock = false;

    $ctrl.$onInit = function() {
        let sort = {
            'pending': 0,
            'approved': 1,
            'declined': 2,
        };

        $ctrl.fundAvailableInvitations = $ctrl.fundInvitations.filter(fundInvitation => 
            !fundInvitation.expired
        );

        $ctrl.fundExpiredInvitations = $ctrl.fundInvitations.filter(fundInvitation => 
            fundInvitation.expired
        );

        $ctrl.funds = $ctrl.funds.sort((a, b) => sort[a.state] - sort[b.state]);

        $ctrl.showEmptyBlock = $ctrl.checkForEmptyList();
        $ctrl.emptyBlockMsg  = $ctrl.getEmptyBlockMessage();
    };

    $ctrl.filterByFundStatus = (type) => {
        $ctrl.shownFundsType = type;

        $ctrl.showEmptyBlock = $ctrl.checkForEmptyList();
        $ctrl.emptyBlockMsg  = $ctrl.getEmptyBlockMessage();
    };

    $ctrl.checkForEmptyList = () => {
        return ($ctrl.shownFundsType == 'available' && $ctrl.fundsAvailable.length == 0) ||
            ($ctrl.shownFundsType    == 'active' && $ctrl.funds.length == 0) ||
            ($ctrl.shownFundsType    == 'invitations' && $ctrl.fundAvailableInvitations.length == 0) ||
            ($ctrl.shownFundsType    == 'invitations-expired' && $ctrl.fundExpiredInvitations.length == 0);
    };

    $ctrl.getEmptyBlockMessage = () => {
        if (!$ctrl.checkForEmptyList()) {
            return '';
        }

        switch($ctrl.shownFundsType) {
            case 'available': return trans_fund_provider('no_available_funds'); break;
            case 'active':    return trans_fund_provider('no_active_funds'); break;
            case 'invitations': return trans_fund_provider('no_pending_invitations'); break;
            case 'invitations-expired': return trans_fund_provider('no_expired_invitations'); break;
        }
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