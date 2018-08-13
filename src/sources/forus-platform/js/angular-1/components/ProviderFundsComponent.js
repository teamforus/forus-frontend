let ProviderFundsComponent = function(
    $state,
    $stateParams
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.emptyBlockLink = $state.href('provider-funds-available', $stateParams);
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