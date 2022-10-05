const ReimbursementsComponent = function(ReimbursementService) {
    const $ctrl = this;

    $ctrl.filters = {
        page: 1,
        per_page: 15,
        state: null,
        fund_id: null,
        active: 1,
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

        ReimbursementService.list({
            ...$ctrl.filters,
            ...{ fund_id: query?.fund_id }
        }).then((res) => {
            $ctrl.reimbursements = res.data;
        });
    };

    $ctrl.$onInit = function() {
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
        ReimbursementsComponent,
    ],
    templateUrl: 'assets/tpl/pages/reimbursements.html',
};