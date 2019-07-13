let ProductComponent = function (
    $rootScope,
    $scope,
    $state,
    $filter,
    $sce,
    appConfigs,
    ModalService,
    VoucherService
) {
    let $ctrl = this;
    let vouchers = [];

    if (!appConfigs.features.products.show) {
        return $state.go('home');
    }

    $scope.openAuthPopup = function () {
        ModalService.open('modalAuth', {});
    };

    $ctrl.isApplicable = false;

    $ctrl.$onInit = function() {
        let fundIds = $ctrl.product.funds.map(fund => fund.id);
        vouchers = $ctrl.vouchers.filter(function(voucher) {
            return (fundIds.indexOf(voucher.fund_id) != -1) && (
                parseFloat($ctrl.product.price) <= parseFloat(voucher.amount)
            ) && !voucher.parent;
        });

        $ctrl.isApplicable = vouchers.length > 0;
        $ctrl.product.description_html = $sce.trustAsHtml($ctrl.product.description_html);
    };

    $ctrl.applyProduct = () => {
        if(vouchers.length == 1){
            let voucher = vouchers[0];

            let fund_expire_at = moment(voucher.fund.end_date);
            let product_expire_at = moment($ctrl.product.expire_at);

            let expire_at = fund_expire_at.isAfter(product_expire_at) ? $ctrl.product.expire_at_locale : voucher.fund.end_date_locale;

            return ModalService.open('modalProductApply', {
                expire_at: expire_at,
                product: $ctrl.product,
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
        '$rootScope',
        '$scope',
        '$state',
        '$filter',
        '$sce',
        'appConfigs',
        'ModalService',
        'VoucherService',
        ProductComponent
    ],
    templateUrl: 'assets/tpl/pages/product.html'
};