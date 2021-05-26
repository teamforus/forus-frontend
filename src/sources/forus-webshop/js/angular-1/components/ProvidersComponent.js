const ProvidersComponent = function(
    $state,
    $stateParams,
    FormBuilderService,
    ProvidersService
) {
    const $ctrl = this;

    $ctrl.showmap = false;
    $ctrl.officesShown = [];
    $ctrl.countFiltersApplied = 0;

    $ctrl.filtersList = [
        'q', 'fund', 'businessType',
    ];

    $ctrl.toggleMobileMenu = () => {
        $ctrl.showModalFilters ? $ctrl.hideMobileMenu() : $ctrl.showMobileMenu()
    };

    $ctrl.showMobileMenu = () => {
        $ctrl.showModalFilters = true;
        $ctrl.updateState($ctrl.buildQuery($ctrl.form.values));
    };

    $ctrl.hideMobileMenu = () => {
        $ctrl.showModalFilters = false;
        $ctrl.updateState($ctrl.buildQuery($ctrl.form.values));
    };

    $ctrl.mapOptions = {
        fullscreenControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        },
    };

    $ctrl.buildQuery = (values) => ({
        q: values.q,
        page: values.page,
        fund_id: values.fund ? values.fund.id : null,
        business_type_id: values.businessType ? values.businessType.id : null,
    });

    $ctrl.onPageChange = (values) => {
        const query = $ctrl.buildQuery(values);

        $ctrl.showMap ? $ctrl.loadProvidersMap(query) : $ctrl.loadProviders(query);
    };

    $ctrl.showAsMap = () => {
        $ctrl.showMap = true;
        $ctrl.loadProvidersMap({ ...$ctrl.buildQuery($ctrl.form.values), ...{ page: 1 } }, true);
    }

    $ctrl.showAsList = () => {
        $ctrl.showMap = false;
        $ctrl.loadProviders({ ...$ctrl.buildQuery($ctrl.form.values), ...{ page: 1 } }, true);
    }

    $ctrl.loadProviders = (query, location = 'replace') => {
        ProvidersService.search(Object.assign({}, query)).then(res => {
            $ctrl.providers = res.data;
        });

        $ctrl.updateState(query, location);
        $ctrl.updateFiltersUsedCount();
    };

    $ctrl.loadProvidersMap = (query, location = 'replace') => {
        ProvidersService.search({ ...{ per_page: 1000 }, ...query }).then(res => {
            $ctrl.providersAll = res.data;
            $ctrl.offices = $ctrl.providersAll.data.reduce((arr, provider) => {
                return arr.concat(provider.offices);
            }, []);
        });

        $ctrl.updateState(query, location);
        $ctrl.updateFiltersUsedCount();
    };

    $ctrl.updateState = (query, location = 'replace') => {
        $state.go('providers', {
            q: query.q || '',
            page: query.page,
            fund_id: query.fund_id,
            business_type_id: query.business_type_id,
            show_map: $ctrl.showMap,
            show_menu: $ctrl.showModalFilters,
        }, { location });
    };

    $ctrl.updateFiltersUsedCount = () => {
        let count = 0;

        $ctrl.form.values.q && count++;
        $ctrl.form.values.fund && $ctrl.form.values.fund.id && count++;
        $ctrl.form.values.businessType && $ctrl.form.values.businessType.id && count++;
        $ctrl.countFiltersApplied = count;
    };

    $ctrl.$onInit = () => {
        $ctrl.showMap = $stateParams.show_map;
        $ctrl.businessTypes.unshift({
            id: null,
            name: 'Alle typen',
        });

        $ctrl.funds.unshift({
            id: null,
            name: 'Alle tegoeden',
        });

        const fund = $ctrl.funds.filter(fund => {
            return fund.id == $stateParams.fund_id;
        })[0] || $ctrl.funds[0];

        const businessType = $ctrl.businessTypes.filter(businessType => {
            return businessType.id == $stateParams.business_type_id;
        })[0] || $ctrl.businessTypes[0];

        $ctrl.showModalFilters = $stateParams.show_menu;
        $ctrl.form = FormBuilderService.build({
            q: $stateParams.q || '',
            fund: fund,
            businessType: businessType,
        });

        if ($ctrl.showMap) {
            $ctrl.loadProvidersMap($ctrl.buildQuery($ctrl.form.values));
        }

        $ctrl.updateFiltersUsedCount();
    };
};

module.exports = {
    bindings: {
        funds: '<',
        providers: '<',
        businessTypes: '<',
    },
    controller: [
        '$state',
        '$stateParams',
        'FormBuilderService',
        'ProvidersService',
        ProvidersComponent
    ],
    templateUrl: 'assets/tpl/pages/providers.html'
};
