let ProductComponent = function(
    $state,
    appConfigs
) {
    let $ctrl = this;

    if (!appConfigs.features.products.show) {
        return $state.go('home');
    }

    $ctrl.isApplicable = false;

    $ctrl.$onInit = function() {
        let fundIds = $ctrl.product.funds.map(fund => fund.id);

        $ctrl.isApplicable = $ctrl.vouchers.filter(function(voucher) {
            return (fundIds.indexOf(voucher.fund_id) != -1) && (
                parseFloat($ctrl.product.price) <= parseFloat(voucher.amount)
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
        'appConfigs',
        ProductComponent
    ],
    templateUrl: 'assets/tpl/pages/product.html'
};