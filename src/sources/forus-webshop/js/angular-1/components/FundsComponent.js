let FundsComponent = function(
    $state,
    $rootScope,
    $timeout,
    CredentialsService,
    IdentityService,
    AuthService,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.funds = $ctrl.funds.map(function(fund) {
            fund.categories = fund.product_categories.map(function(category) {
                return category.name;
            }).join(', ');

            fund.voucherWasTaken = $ctrl.vouchers.filter(voucher => {
                return voucher.fund_id == fund.id;
            }).length > 0;

            return fund;
        });
    };
};

module.exports = {
    bindings: {
        funds: '<',
        vouchers: '<'
    },
    controller: [
        '$state',
        '$rootScope',
        '$timeout',
        'CredentialsService',
        'IdentityService',
        'AuthService',
        'appConfigs',
        FundsComponent
    ],
    templateUrl: 'assets/tpl/pages/funds.html'
};