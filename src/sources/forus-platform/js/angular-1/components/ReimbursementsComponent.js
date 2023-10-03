const ReimbursementsComponent = function (
    ReimbursementsExportService,
    LocalStorageService,
    ReimbursementService,
    PageLoadingBarService,
) {
    const $ctrl = this;

    $ctrl.states_options = ReimbursementService.getStateOptions();
    $ctrl.expired_options = ReimbursementService.getExpiredOptions();
    $ctrl.archived_options = ReimbursementService.getArchivedOptions();
    $ctrl.deactivated_options = ReimbursementService.getDeactivatedOptions();

    $ctrl.paginationStorageKey = 'reimbursements_per_page';

    $ctrl.filters = {
        show: false,
        defaultValues: {
            q: '',
            state: null,
            amount_min: null,
            amount_max: null,
            expired: null,
            archived: 0,
            deactivated: null,
            from: null,
            to: null,
            page: 1,
            per_page: LocalStorageService.getCollectionItem('pagination', $ctrl.paginationStorageKey, 15),
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

    $ctrl.setArchivedOption = (archived) => {
        $ctrl.filters.values.expired = null;
        $ctrl.filters.values.archived = archived;
        $ctrl.filters.values.deactivated = null;
    };

    $ctrl.exportReimbursements = () => {
        $ctrl.hideFilters()

        ReimbursementsExportService.export($ctrl.organization.id, {
            ...$ctrl.filters.values, per_page: undefined,
        });
    };

    $ctrl.onPageChange = (query) => {
        PageLoadingBarService.setProgress(0);

        ReimbursementService.index($ctrl.organization.id, $ctrl.getQueryParams(query))
            .then((res) => $ctrl.reimbursements = res.data)
            .finally(() => PageLoadingBarService.setProgress(100));
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
        'ReimbursementsExportService',
        'LocalStorageService',
        'ReimbursementService',
        'PageLoadingBarService',
        ReimbursementsComponent,
    ],
    templateUrl: 'assets/tpl/pages/reimbursements.html',
};