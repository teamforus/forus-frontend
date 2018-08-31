let ProviderFundsComponent = function(
    $state,
    $stateParams
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.emptyBlockLink = $state.href('provider-funds-available', $stateParams);
        $ctrl.activeFunds = $ctrl.funds.filter(function(fund) {
            return fund.state == 'approved';
        });
    };
};

module.exports = {
    bindings: {
        funds: '<',
        fundLevel: '<',
        organization: '<',
    },
    controller: [
        '$state',
        '$stateParams',
        ProviderFundsComponent
    ],
    templateUrl: 'assets/tpl/pages/provider-funds.html'
};