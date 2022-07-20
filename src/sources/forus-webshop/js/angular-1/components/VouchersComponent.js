const VouchersComponent = function(
    VoucherService
) {
    const $ctrl = this;

    $ctrl.availability_type = 'active';

    const filterByType = () => {
        $ctrl.regularVouchers = $ctrl.vouchers.filter(function(voucher) {
            return voucher.type == 'regular';
        });

        $ctrl.productVouchers = $ctrl.vouchers.filter(function(voucher) {
            return voucher.type == 'product';
        });
    };

    $ctrl.filterByAvailability = (type) => {
        $ctrl.availability_type = type;

        VoucherService.list({
            can_be_used: type == 'active' ? 1 : 0
        }).then(res => {
            $ctrl.vouchers = res.data.data;
            filterByType();
        });
    };

    $ctrl.$onInit = function() {
        filterByType();
    };
};

module.exports = {
    bindings: {
        vouchers: '<'
    },
    controller: [
        'VoucherService',
        VouchersComponent
    ],
    templateUrl: 'assets/tpl/pages/vouchers.html'
};