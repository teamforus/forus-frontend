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

    $ctrl.states = [{
        name: 'In afwachting',
        value: 'pending',
    }, {
        name: 'Geaccepteerd',
        value: 'accepted',
    }, {
        name: 'Geweigerd',
        value: 'rejected',
    }, {
        name: 'Geannuleerd',
        value: 'canceled',
    }];

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
        $ctrl.states.unshift({
            name: 'Selecteer status...',
            value: null,
        });

        $ctrl.funds.unshift({
            name: 'Alle tegoeden',
            id: null,
        });

        $ctrl.organizations.unshift({
            name: 'Selecteer aanbieder...',
            id: null,
        });
    };
};

module.exports = {
    bindings: {
        funds: '<',
        vouchers: '<',
        organizations: '<',
        reimbursements: '<',
    },
    controller: [
        'ReimbursementService',
        'PageLoadingBarService',
        ReimbursementsComponent,
    ],
    templateUrl: 'assets/tpl/pages/reimbursements.html',
};