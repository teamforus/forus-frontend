let ProvidersComponent = function(
    $state,
    $stateParams,
    $timeout,
    FormBuilderService,
    ProvidersService
) {
    let $ctrl = this;
    let timeout = false;

    $ctrl.showmap = false;
    $ctrl.officesShown = [];

    $ctrl.filtersList = [
        'q', 'fund', 'businessType', 
    ];

    $ctrl.objectOnly = (obj, props = []) => {
        let out = {};

        for (const prop in obj) {
            if (obj.hasOwnProperty(prop) && props.indexOf(prop) != -1) {
                out[prop] = obj[prop];
            }
        }

        return out;
    };

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
        //-centerType: 'avg',
        fullscreenControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        },
    };

    $ctrl.toggleOffices = ($event, provider) => {
        $event.preventDefault();
        $event.stopPropagation();

        if ($ctrl.officesShown.indexOf(provider.id) == -1) {
            $ctrl.officesShown.push(provider.id);
        } else {
            $ctrl.officesShown.splice($ctrl.officesShown.indexOf(provider.id), 1);
        }
    };

    $ctrl.cancel = () => {
        if (typeof($ctrl.modal.scope.cancel) === 'function') {
            $ctrl.modal.scope.cancel();
        }

        $ctrl.close();
    };

    $ctrl.buildQuery = (values) => ({
        q: values.q,
        page: values.page,
        fund_id: values.fund ? values.fund.id : null,
        business_type_id: values.businessType ? values.businessType.id : null,
    });

    $ctrl.onFormChange = (values) => {
        if (timeout) {
            $timeout.cancel(timeout);
        }

        timeout = $timeout(() => {
            $ctrl.onPageChange(values);
        }, 1000);
    };

    $ctrl.onPageChange = (values) => {
        $ctrl.showMap ? $ctrl.loadProvidersMap(
            $ctrl.buildQuery(values)
        ) : $ctrl.loadProviders(
            $ctrl.buildQuery(values)
        );
    };

    $ctrl.goToOffice = (office) => {
        $state.go('provider-office', {
            provider_id: office.organization_id,
            office_id: office.id
        });
    };

    $ctrl.showAsMap = () => {
        $ctrl.showMap = true;
        $ctrl.loadProvidersMap(Object.assign($ctrl.buildQuery($ctrl.form.values), {
            page: 1
        }), true);
    }

    $ctrl.showAsList = () => {
        $ctrl.showMap = false;
        $ctrl.loadProviders($ctrl.buildQuery($ctrl.form.values), true);
    }

    $ctrl.loadProviders = (query, location = 'replace') => {
        ProvidersService.search(Object.assign({}, query)).then(res => {
            $ctrl.providers = res.data;
        });

        $ctrl.updateState(query, location);
        $ctrl.updateFiltersUsedCount();
    };

    $ctrl.loadProvidersMap = (query, location = 'replace') => {
        ProvidersService.search(Object.assign({
            per_page: 1000,
        }, query)).then(res => {
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
        }, {
            location: location,
        });
    };

    $ctrl.updateFiltersUsedCount = () => {
        $ctrl.countFiltersApplied = Object.values(
            $ctrl.objectOnly($ctrl.form.values, $ctrl.filtersList)
        ).reduce((count, filter) => count + (filter ? (
            typeof filter == 'object' ? (filter.id ? 1 : 0) : 1
        ) : 0), 0);
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

        let fund = $ctrl.funds.filter(fund => {
            return fund.id == $stateParams.fund_id;
        })[0] || $ctrl.funds[0];

        let businessType = $ctrl.businessTypes.filter(businessType => {
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
        '$timeout',
        'FormBuilderService',
        'ProvidersService',
        ProvidersComponent
    ],
    templateUrl: 'assets/tpl/pages/providers.html'
};
