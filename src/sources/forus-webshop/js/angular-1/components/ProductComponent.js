let ProductComponent = function (
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
      
        vouchers = $ctrl.vouchers.filter(function (voucher) {
            return (fundIds.indexOf(voucher.fund_id) != -1) && (
                parseFloat($ctrl.product.price) <= parseFloat(voucher.amount)
            ) && !voucher.parent;
        });

        $ctrl.isApplicable = vouchers.length > 0;

        $ctrl.product.html_desc = $sce.trustAsHtml($ctrl.product.html_description);
    };

    $ctrl.applyProduct = () => {
        if(vouchers.length == 1){
            let voucher = vouchers[0];

            let fund_expire_at = moment(voucher.fund.end_date);
            let product_expire_at = moment($ctrl.product.expire_at);

            let expire_at = fund_expire_at.isAfter(product_expire_at) ? $ctrl.product.expire_at_locale : voucher.fund.end_date_locale;

            let popupDescription = $filter('i18n')('product_apply.popup.title', {
                    product_name: $ctrl.product.name,
                    expire_at: expire_at,
                    product_price: $ctrl.product.price
                });

            let popupSubDescription = $filter('i18n')('product_apply.popup.expiration_information', {
                expire_at: expire_at
            });

            return ModalService.open('modalNotification', {
                type: 'confirm',
                description: popupDescription,
                subdescription: popupSubDescription,
                icon: 'voucher_apply',
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
        '$filter',
        '$sce',
        'appConfigs',
        'ModalService',
        'VoucherService',
        ProductComponent
    ],
    templateUrl: 'assets/tpl/pages/product.html'
};