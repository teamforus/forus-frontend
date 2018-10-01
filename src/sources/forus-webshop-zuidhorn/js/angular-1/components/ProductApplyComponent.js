let ProductApplyComponent = function (
    $state,
    $rootScope,
    $timeout,
    CredentialsService,
    IdentityService,
    VoucherService,
    AuthService,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.isApplicable = false;

    $ctrl.$onInit = function () {
        let fundIds = $ctrl.product.funds.map(fund => fund.id);

        $ctrl.applicableVouchers = $ctrl.vouchers.filter(function (voucher) {
            return (fundIds.indexOf(voucher.fund_id) != -1) && (
                $ctrl.product.price <= voucher.amount
            ) && !voucher.parent;
        });

        $ctrl.isApplicable = $ctrl.applicableVouchers.length > 0;

        if (!$ctrl.isApplicable) {
            return $state.go('products-show', {id: $ctrl.product.id});
        }
    };

    $ctrl.applyForProduct = (voucher) => {
        VoucherService.makeProductVoucher(
            voucher.address,
            $ctrl.product.id
        ).then(res => {
            $state.go('voucher', res.data.data);
        }, console.error);
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
        'VoucherService',
        'AuthService',
        'appConfigs',
        ProductApplyComponent
    ],
    templateUrl: 'assets/tpl/pages/product-apply.html'
};