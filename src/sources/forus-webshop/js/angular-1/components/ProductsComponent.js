let ProductsComponent = function(
    $scope,
    $state,
    $stateParams,
    $timeout,
    appConfigs,
    FormBuilderService,
    ProductService
) {
    let $ctrl = this;
    let timeout = false;

    $ctrl.sortByOptions = [{
        label: 'Prijs (oplopend)',
        value: {
            order_by: 'price',
            order_by_dir: 'asc',
        }
    }, {
        label: 'Prijs (aflopend)',
        value: {
            order_by: 'price',
            order_by_dir: 'desc',
        }
    }, {
        label: 'Oudste eerst',
        value: {
            order_by: 'created_at',
            order_by_dir: 'asc',
        }
    }, {
        label: 'Nieuwe eerst',
        value: {
            order_by: 'created_at',
            order_by_dir: 'desc',
        }
    }];

    $ctrl.filtersList = [
        'q', 'product_category_id', 'fund', 'sortBy',
    ];

    $ctrl.sort_by = $ctrl.sortByOptions[$ctrl.sortByOptions.length - 1];

    $ctrl.objectOnly = (obj, props = []) => {
        let out = {};

        for (const prop in obj) {
            if (obj.hasOwnProperty(prop) && props.indexOf(prop) != -1) {
                out[prop] = obj[prop];
            }
        }

        return out;
    };

    $ctrl.toggleOrderDropdown = ($event) => {
        $event ? $event.stopPropagation() : '';
        $ctrl.show_order_dropdown = !$ctrl.show_order_dropdown;
    };

    $ctrl.hideOrderDropdown = ($event) => {
        $event ? $event.stopPropagation() : '';
        $ctrl.show_order_dropdown = false;
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

    $ctrl.cancel = () => {
        if (typeof ($ctrl.modal.scope.cancel) === 'function') {
            $ctrl.modal.scope.cancel();
        }

        $ctrl.close();
    };

    $ctrl.showAs = (display_type) => {
        $ctrl.display_type = display_type;
        $ctrl.updateState($ctrl.buildQuery($ctrl.form.values));
    };

    $ctrl.sortBy = ($event, sort_by) => {
        $event.preventDefault();
        $event.stopPropagation();

        $ctrl.sort_by = sort_by;
        $ctrl.show_order_dropdown = false;

        $ctrl.onPageChange({ ...$ctrl.form.values });
    };

    $ctrl.buildQuery = (values) => {
        const orderByValue = {
            ...$ctrl.sort_by.value,
            ...{
                order_by: $ctrl.sort_by.value.order_by === 'price' ? (
                    $ctrl.fund_type === 'budget' ? 'price' : 'price_min'
                ) : $ctrl.sort_by.value.order_by,
            }
        };

        return {
            q: values.q,
            organization_id: values.organization_id,
            page: values.page,
            product_category_id: values.product_category_id,
            fund_id: values.fund ? values.fund.id : null,
            display_type: $ctrl.display_type,
            ...orderByValue
        };
    };

    $ctrl.onFormChange = (values) => {
        if (timeout) {
            $timeout.cancel(timeout);
        }

        timeout = $timeout(() => {
            $ctrl.onPageChange(values);
        }, 1000);
    };

    $ctrl.onPageChange = (values) => {
        $ctrl.loadProducts($ctrl.buildQuery(values));
    };

    $ctrl.goToProduct = (product) => {
        $state.go('product', {
            product_id: product.id,
        });
    };

    $ctrl.loadProducts = (query, location = 'replace') => {
        ProductService.list(Object.assign({
            fund_type: $ctrl.type
        }, query)).then(res => $ctrl.products = res.data);

        $ctrl.updateState(query, location);
        $ctrl.updateFiltersUsedCount();
    };

    $ctrl.updateState = (query, location = 'replace') => {
        $state.go($ctrl.fund_type == 'budget' ? 'products' : 'actions', {
            q: query.q || '',
            page: query.page,
            display_type: query.display_type,
            fund_id: query.fund_id,
            organization_id: query.organization_id,
            product_category_id: query.product_category_id,
            show_map: $ctrl.showMap,
            show_menu: $ctrl.showModalFilters,
        }, { location });
    };

    $ctrl.updateFiltersUsedCount = () => {
        $ctrl.countFiltersApplied = Object.values(
            $ctrl.objectOnly($ctrl.form.values, $ctrl.filtersList)
        ).reduce((count, filter) => count + (filter ? (
            typeof filter == 'object' ? (filter.id ? 1 : 0) : 1
        ) : 0), 0);
    };

    $ctrl.$onInit = () => {
        $ctrl.showModalFilters = $stateParams.show_menu;
        $ctrl.display_type = $stateParams.display_type;
        $ctrl.fund_type = $stateParams.fund_type;
        $ctrl.show_order_dropdown = false;

        $scope.appConfigs = appConfigs;
        $scope.$watch('appConfigs', (_appConfigs) => {
            if (_appConfigs.features && !_appConfigs.features.products.list) {
                $state.go('home');
            }
        }, true);

        $ctrl.funds.unshift({
            id: null,
            name: 'Alle tegoeden',
        });

        $ctrl.productCategories.unshift({
            name: 'Selecteer categorie...',
            id: null
        });

        $ctrl.organizations.unshift({
            name: 'Selecteer aanbieder...',
            id: null
        });

        const fund = $ctrl.funds.filter(fund => {
            return fund.id == $stateParams.fund_id;
        })[0] || $ctrl.funds[0];

        $ctrl.form = FormBuilderService.build({
            q: $stateParams.q || '',
            organization_id: $stateParams.organization_id || null,
            product_category_id: $stateParams.product_category_id || null,
            fund: fund,
        });

        $ctrl.updateFiltersUsedCount();
    };
};

module.exports = {
    bindings: {
        fund_type: '<',
        funds: '<',
        products: '<',
        productCategories: '<',
        organizations: '<',
    },
    controller: [
        '$scope',
        '$state',
        '$stateParams',
        '$timeout',
        'appConfigs',
        'FormBuilderService',
        'ProductService',
        ProductsComponent
    ],
    templateUrl: 'assets/tpl/pages/products.html'
};