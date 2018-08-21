let ProviderFundsAvailableComponent = function(
    $state,
    $stateParams
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        console.log($ctrl.pendingFunds);
    };
};

module.exports = {
    bindings: {
        funds: '<',
        pendingFunds: '<',
        fundLevel: '<',
        organization: '<',
    },
    controller: [
        '$state',
        '$stateParams',
        ProviderFundsAvailableComponent
    ],
    templateUrl: 'assets/tpl/pages/provider-funds-available.html'
};