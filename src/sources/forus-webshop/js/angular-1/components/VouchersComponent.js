const VouchersComponent = function (
    VoucherService
) {
    const $ctrl = this;

    $ctrl.archived = false;
    $ctrl.perPage = 15;
    $ctrl.filters = {
        archived: $ctrl.archived ? 1 : 0,
        per_page: $ctrl.perPage
    };

    const groupByType = (vouchers) => {
        $ctrl.regularVouchers = vouchers.filter((voucher) => voucher.type == 'regular');
        $ctrl.productVouchers = vouchers.filter((voucher) => voucher.type == 'product');
    };

    $ctrl.onPageChange = (query = {}) => {
        query = { ...$ctrl.filters, ...query };

        VoucherService.list(query).then((res) => {
            $ctrl.vouchers = res.data;
            groupByType(res.data.data);
        });
    };

    $ctrl.setArchived = (archived) => {
        $ctrl.archived = archived;
        $ctrl.filters = { ...$ctrl.filters, archived: archived ? 1 : 0, page: 1 };
    };

    $ctrl.$onInit = function () {
        groupByType($ctrl.vouchers.data);
    };
};

module.exports = {
    bindings: {
        vouchers: '<',
        reimbursementVouchers: '<',
    },
    controller: [
        'VoucherService',
        VouchersComponent,
    ],
    templateUrl: 'assets/tpl/pages/vouchers.html',
};