const VouchersComponent = function (
    VoucherService
) {
    const $ctrl = this;

    $ctrl.archived = false;

    const groupByType = (vouchers) => {
        $ctrl.regularVouchers = vouchers.filter((voucher) => voucher.type == 'regular');
        $ctrl.productVouchers = vouchers.filter((voucher) => voucher.type == 'product');
    };

    $ctrl.setArchived = (archived) => {
        $ctrl.archived = archived;

        VoucherService.list({ archived: $ctrl.archived ? 1 : 0 }).then((res) => {
            $ctrl.vouchers = res.data.data;
            groupByType(res.data.data);
        });
    };

    $ctrl.$onInit = function () {
        groupByType($ctrl.vouchers);
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