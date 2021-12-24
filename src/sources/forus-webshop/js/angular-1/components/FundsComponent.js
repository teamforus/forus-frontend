const FundsComponent = function(
    $q,
    $state,
    $stateParams,
    appConfigs,
    FundService,
    FormBuilderService,
) {
    const $ctrl = this;

    $ctrl.applyingFund = false;
    $ctrl.appConfigs = appConfigs;
    $ctrl.countFiltersApplied = 0;
    $ctrl.fundCategories = [];

    $ctrl.toggleMobileMenu = () => {
        $ctrl.showModalFilters ? $ctrl.hideMobileMenu() : $ctrl.showMobileMenu()
    };

    $ctrl.showMobileMenu = () => {
        $ctrl.showModalFilters = true;
        $ctrl.updateState($ctrl.form.values);
    };

    $ctrl.hideMobileMenu = () => {
        $ctrl.showModalFilters = false;
        $ctrl.updateState($ctrl.form.values);
    };

    $ctrl.updateState = (query) => {
        $state.go('funds', {
            q: query.q || '',
            page: query.page,
            organization_id: query.organization_id,
            category_tag_id: query.category_tag_id,
            show_menu: $ctrl.showModalFilters,
            with_external: 1,
        });
    };

    $ctrl.updateFiltersUsedCount = () => {
        let count = 0;

        $ctrl.form.values.q && count++;
        $ctrl.form.values.organization_id && count++;
        $ctrl.countFiltersApplied = count;
    };

    $ctrl.loadFunds = (query, location = 'replace') => {
        return $q((resolve, reject) => {
            FundService.list(null, query).then(res => {
                $ctrl.funds = res.data;
                $ctrl.updateState(query, location);
                $ctrl.updateFiltersUsedCount();
                resolve();
            }, reject);
        });
    };

    $ctrl.onPageChange = (values) => {
        $ctrl.loadFunds(values);
    };

    $ctrl.$onInit = function() {
        if (!appConfigs.features || !appConfigs.features.funds.list) {
            return $state.go('home');
        }

        $ctrl.showModalFilters = $stateParams.show_menu;

        $ctrl.organizations.unshift({
            id: null,
            name: 'Alle organisaties',
        });

        $ctrl.fundCategories.unshift({
            tag_id: null,
            tag_name: 'Alle categories',
        });

        $ctrl.funds.data.forEach(fund => {
            $ctrl.fundCategories = [...$ctrl.fundCategories, ...fund.categories];
        });

        $ctrl.fundCategories = [
            ...new Map($ctrl.fundCategories.map(fundCategory => [fundCategory['tag_id'], fundCategory])).values()
        ];

        $ctrl.form = FormBuilderService.build({
            q: $stateParams.q || '',
            organization_id: $stateParams.organization_id || null,
            category_tag_id: $stateParams.category_tag_id || null,
            per_page: $stateParams.per_page || 10,
            with_external: 1,
        });

        $ctrl.updateFiltersUsedCount();
    };
};

module.exports = {
    bindings: {
        funds: '<',
        records: '<',
        vouchers: '<',
        organizations: '<',
    },
    controller: [
        '$q',
        '$state',
        '$stateParams',
        'appConfigs',
        'FundService',
        'FormBuilderService',
        FundsComponent
    ],
    templateUrl: 'assets/tpl/pages/funds.html'
};