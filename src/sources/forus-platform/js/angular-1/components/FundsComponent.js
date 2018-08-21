let FundsComponent = function(
    $state,
    $stateParams
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.emptyBlockLink = $state.href('funds-create', $stateParams);
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