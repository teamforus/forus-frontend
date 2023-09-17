const FundsComponent = function(
    $q,
    $state,
    $rootScope,
    $stateParams,
    appConfigs,
    FundService,
    FormBuilderService,
) {
    const $ctrl = this;

    $ctrl.applyingFund = false;
    $ctrl.appConfigs = appConfigs;
    $ctrl.countFiltersApplied = 0;

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
            tag_id: query.tag_id,
            organization_id: query.organization_id,
            show_menu: $ctrl.showModalFilters,
            with_external: 1,
        });
    };

    $ctrl.updateFiltersUsedCount = () => {
        let count = 0;

        $ctrl.form.values.q && count++;
        $ctrl.form.values.tag_id && count++;
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

    $ctrl.goToFundPage = (fund) => {
        if (fund.external_page && fund.external_page_url) {
            return document.location = fund.external_page_url;
        }

        $state.go('fund', {id: fund.id})
    };

    $ctrl.$onInit = function() {
        if (!appConfigs.features || !appConfigs.features.funds.list) {
            return $state.go('home');
        }

        $ctrl.showModalFilters = $stateParams.show_menu;

        $ctrl.tags.unshift({
            id: null,
            name: 'Alle categorieën',
        });

        $ctrl.organizations.unshift({
            id: null,
            name: 'Alle organisaties',
        });

        $ctrl.form = FormBuilderService.build({
            q: $stateParams.q || '',
            tag_id: $stateParams.tag_id || null,
            organization_id: $stateParams.organization_id || null,
            per_page: $stateParams.per_page || 10,
            with_external: 1,
        });

        $ctrl.updateFiltersUsedCount();

        if ($rootScope.client_key == 'vergoedingen') {
            $rootScope.pageTitle = 'Vergoedingen';
        }
    };
};

module.exports = {
    bindings: {
        tags: '<',
        funds: '<',
        records: '<',
        vouchers: '<',
        organizations: '<',
    },
    controller: [
        '$q',
        '$state',
        '$rootScope',
        '$stateParams',
        'appConfigs',
        'FundService',
        'FormBuilderService',
        FundsComponent,
    ],
    templateUrl: 'assets/tpl/pages/funds.html',
};