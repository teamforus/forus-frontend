const ReimbursementsComponent = function (
    ReimbursementService,
) {
    const $ctrl = this;

    $ctrl.reimbursement_states = ReimbursementService.getStates();
    $ctrl.expired_options = ReimbursementService.getExpiredOptions();

    $ctrl.filters = {
        show: false,
        defaultValues: {
            q: '',
            state: null,
            amount_min: null,
            amount_max: null,
            expired: null,
            from: null,
            to: null,
            page: 1,
        },
        values: {},
        reset: function () {
            this.values = { ...this.defaultValues };
        }
    };

    $ctrl.resetFilters = () => {
        $ctrl.filters.reset();
    };

    $ctrl.hideFilters = () => {
        $ctrl.filters.show = false;
    };

    $ctrl.init = () => {
        $ctrl.resetFilters();
        $ctrl.onPageChange($ctrl.filters.values);
    };

    $ctrl.onFundSelect = (fund) => {
        $ctrl.fund = fund;
        $ctrl.init();
    };

    $ctrl.getQueryParams = (query = {}) => {
        return { ...angular.copy(query), fund_id: $ctrl.fund.id };
    };

    $ctrl.onPageChange = (query) => {
        ReimbursementService.index(
            $ctrl.organization.id,
            $ctrl.getQueryParams(query),
        ).then((res => $ctrl.reimbursements = res.data));
    };

    $ctrl.$onInit = () => {
        $ctrl.init();
    };
};

module.exports = {
    bindings: {
        fund: '<',
        funds: '<',
        organization: '<',
    },
    controller: [
        'ReimbursementService',
        ReimbursementsComponent,
    ],
    templateUrl: 'assets/tpl/pages/reimbursements.html',
};