let OrganizationFundsComponent = function(
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
        fundLevel: '<',
        organization: '<'
    },
    controller: [
        '$state',
        '$stateParams',
        OrganizationFundsComponent
    ],
    templateUrl: 'assets/tpl/pages/organization-funds.html'
};