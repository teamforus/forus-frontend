const VouchersComponent = function (
    VoucherService
) {
    const $ctrl = this;

    $ctrl.filters = {
        per_page: 15,
        archived: 0,
        order_by: 'voucher_type',
        order_dir: 'desc',
    };

    $ctrl.onPageChange = (query = {}) => {
        VoucherService.list({ ...$ctrl.filters, ...query }).then((res) => $ctrl.vouchers = res.data);
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