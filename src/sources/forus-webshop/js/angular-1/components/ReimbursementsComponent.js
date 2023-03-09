const ReimbursementsComponent = function (
    ReimbursementService,
    PageLoadingBarService,
) {
    const $ctrl = this;

    $ctrl.filters = {
        page: 1,
        archived: 0,
        state: null,
        per_page: 15,
        fund_id: null,
    };

    $ctrl.onDelete = () => {
        $ctrl.onPageChange();
    };

    $ctrl.onPageChange = (query = {}) => {
        $ctrl.filters = { ...$ctrl.filters, ...query };

        const { state, archived, fund_id } = query;
        const data = { ...$ctrl.filters, fund_id, state: archived ? null : state };

        PageLoadingBarService.setProgress(0);

        ReimbursementService.list(data)
            .then((res) => $ctrl.reimbursements = res.data)
            .finally(() => PageLoadingBarService.setProgress(100));
    };

    $ctrl.$onInit = function () {
        $ctrl.funds.unshift({
            name: 'Alle tegoeden',
            id: null,
        });
    };
};

module.exports = {
    bindings: {
        funds: '<',
        vouchers: '<',
        reimbursements: '<',
    },
    controller: [
        'ReimbursementService',
        'PageLoadingBarService',
        ReimbursementsComponent,
    ],
    templateUrl: 'assets/tpl/pages/reimbursements.html',
};