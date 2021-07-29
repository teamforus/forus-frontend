const VouchersComponent = function() {
    const $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.regularVouchers = $ctrl.vouchers.filter(function(voucher) {
            return voucher.type == 'regular';
        });

        $ctrl.productVouchers = $ctrl.vouchers.filter(function(voucher) {
            return voucher.type == 'product';
        });
    };
};

module.exports = {
    bindings: {
        vouchers: '<'
    },
    controller: [
        VouchersComponent
    ],
    templateUrl: 'assets/tpl/pages/vouchers.html'
};