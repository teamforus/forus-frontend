let ProductComponent = function (
    $state,
    $rootScope,
    $timeout,
    CredentialsService,
    IdentityService,
    AuthService,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.isApplicable = false;

    $ctrl.$onInit = function () {
        let fundIds = $ctrl.product.funds.map(fund => fund.id);

        $ctrl.isApplicable = $ctrl.vouchers.filter(function (voucher) {
            return (fundIds.indexOf(voucher.fund_id) != -1) && (
                $ctrl.product.price <= voucher.amount
            ) && !voucher.parent;
        }).length > 0;
    };
};

module.exports = {
    bindings: {
        product: '<',
        vouchers: '<',
    },
    controller: [
        '$state',
        '$rootScope',
        '$timeout',
        'CredentialsService',
        'IdentityService',
        'AuthService',
        'appConfigs',
        ProductComponent
    ],
    templateUrl: 'assets/tpl/pages/product.html'
};