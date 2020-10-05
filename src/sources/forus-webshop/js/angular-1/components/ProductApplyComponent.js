let ProductApplyComponent = function(
    $state,
    VoucherService,
    ModalService
) {
    let $ctrl = this;

    $ctrl.isApplicable = false;

    $ctrl.$onInit = function() {
        let fundIds = $ctrl.product.funds.map(fund => fund.id);

        $ctrl.applicableVouchers = $ctrl.vouchers.filter(voucher => {
            return (fundIds.indexOf(voucher.fund_id) != -1) && (
                parseFloat($ctrl.product.price) <= parseFloat(voucher.amount)
            ) && !voucher.parent && !voucher.expired;
        });

        $ctrl.isApplicable = $ctrl.applicableVouchers.length > 0;

        if (!$ctrl.isApplicable) {
            return $state.go('products-show', {
                id: $ctrl.product.id
            });
        }
    };

    $ctrl.applyForProduct = (voucher) => {
        let fund_expire_at = moment(voucher.fund.end_date);
        let product_expire_at = moment($ctrl.product.expire_at);

        let expire_at = fund_expire_at.isAfter(product_expire_at) ? $ctrl.product.expire_at_locale : voucher.last_active_day_locale;

        return ModalService.open('modalProductApply', {
            expire_at: expire_at,
            product: $ctrl.product,
            org_name: $ctrl.org_name,
            confirm: () => {

                return VoucherService.makeProductVoucher(
                    voucher.address,
                    $ctrl.product.id
                ).then(res => {
                    $state.go('voucher', res.data.data);
                }, console.error);
            }
        });
    };

};

module.exports = {
    bindings: {
        product: '<',
        vouchers: '<',
    },
    controller: [
        '$state',
        'VoucherService',
        'ModalService',
        ProductApplyComponent
    ],
    templateUrl: 'assets/tpl/pages/product-apply.html'
};