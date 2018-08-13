let FundsComponent = function(
    $state,
    $stateParams
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.emptyBlockLink = $state.href('products-create', $stateParams);
    };
};

module.exports = {
    bindings: {
        funds: '<',
        fundLevel: '<'
    },
    controller: [
        '$state',
        '$stateParams',
        FundsComponent
    ],
    templateUrl: 'assets/tpl/pages/funds.html'
};