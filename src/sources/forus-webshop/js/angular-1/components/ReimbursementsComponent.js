const ReimbursementsComponent = function (
    ReimbursementService,
    PageLoadingBarService,
) {
    const $ctrl = this;

    $ctrl.loaded = false;

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
        const { state, archived, fund_id } = query;
        const data = { ...$ctrl.filters, ...query, fund_id, state: archived ? null : state };

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

        if (!$ctrl.auth2FAState?.restrictions?.reimbursements?.restricted) {
            $ctrl.onPageChange()
        }
    };
};

module.exports = {
    bindings: {
        funds: '<',
        vouchers: '<',
        auth2FAState: '<',
    },
    controller: [
        'ReimbursementService',
        'PageLoadingBarService',
        ReimbursementsComponent,
    ],
    templateUrl: 'assets/tpl/pages/reimbursements.html',
};