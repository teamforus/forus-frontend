let ProductComponent = function (
    $scope,
    $state,
    $sce,
    appConfigs,
    ModalService,
    VoucherService
) {
    let $ctrl = this;

    if (!appConfigs.features.products.show) {
        return $state.go('home');
    }

    $scope.openAuthPopup = function () {
        ModalService.open('modalAuth', {});
    };

    $ctrl.isApplicable = false;

    let isValidProductVoucher = (voucher, fundIds) => {
        return (fundIds.indexOf(voucher.fund_id) != -1) && !voucher.parent && !voucher.expired;
    };

    $ctrl.$onInit = function() {
        let fundIds = $ctrl.product.funds.map(fund => fund.id);

        $ctrl.applicableVouchers = $ctrl.vouchers.filter(voucher => {
            return isValidProductVoucher(voucher, fundIds) && 
                parseFloat($ctrl.product.price) <= parseFloat(voucher.amount);
        });

        $ctrl.lowAmountVouchers = $ctrl.vouchers.filter(voucher => {
            return isValidProductVoucher(voucher, fundIds) && 
                parseFloat($ctrl.product.price) >= parseFloat(voucher.amount);
        });

        $ctrl.fundNames = $ctrl.product.funds.map(fund => fund.name).join(', ');
        $ctrl.isApplicable = $ctrl.applicableVouchers.length > 0;
        $ctrl.product.description_html = $sce.trustAsHtml($ctrl.product.description_html);
    };

    $ctrl.applyProduct = () => {
        if($ctrl.applicableVouchers.length == 1){
            let voucher = $ctrl.applicableVouchers[0];

            let fund_expire_at = moment(voucher.fund.end_date);
            let product_expire_at = moment($ctrl.product.expire_at);

            let expire_at = fund_expire_at.isAfter(product_expire_at) ? $ctrl.product.expire_at_locale : voucher.last_active_day_locale;

            return ModalService.open('modalProductApply', {
                expire_at: expire_at,
                product: $ctrl.product,
                org_name: $ctrl.product.organization.name,
                confirm: () => {
                    return VoucherService.makeProductVoucher(
                        voucher.address,
                        $ctrl.product.id
                    ).then(res => {
                        $state.go('voucher', res.data.data);
                    }, console.error);
                }
            });
        } else {
            return $state.go('products-apply', {
                id: $ctrl.product.id
            });
        }
    };
};

module.exports = {
    scope: {
        text: '=',
        button: '=',
    },
    bindings: {
        product: '<',
        vouchers: '<',
    },
    controller: [
        '$scope',
        '$state',
        '$sce',
        'appConfigs',
        'ModalService',
        'VoucherService',
        ProductComponent
    ],
    templateUrl: 'assets/tpl/pages/product.html'
};