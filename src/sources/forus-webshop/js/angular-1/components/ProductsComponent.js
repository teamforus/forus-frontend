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

    $ctrl.filtersList = [
        'q', 'product_category_id', 'fund',
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

    $ctrl.cancel = () => {
        if (typeof($ctrl.modal.scope.cancel) === 'function') {
            $ctrl.modal.scope.cancel();
        }

        $ctrl.close();
    };

    $ctrl.showAs = (display_type) => {
        $ctrl.display_type = display_type;
        $ctrl.updateState($ctrl.buildQuery($ctrl.form.values));
    };

    $ctrl.buildQuery = (values) => ({
        q: values.q,
        page: values.page,
        product_category_id: values.product_category_id,
        fund_id: values.fund ? values.fund.id : null,
        display_type: $ctrl.display_type,
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
        $ctrl.loadProducts($ctrl.buildQuery(values));
    };

    $ctrl.goToProduct = (product) => {
        $state.go('product', {
            product_id: product.id,
        });
    };

    $ctrl.loadProducts = (query, location = 'replace') => {
        ProductService.list(Object.assign({}, query)).then(res => {
            $ctrl.products = res.data;
        });

        $ctrl.updateState(query, location);
        $ctrl.updateFiltersUsedCount();
    };

    $ctrl.updateState = (query, location = 'replace') => {
        $state.go('products', {
            q: query.q || '',
            page: query.page,
            display_type: query.display_type,
            fund_id: query.fund_id,
            product_category_id: query.product_category_id,
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
        $scope.appConfigs = appConfigs;
        $scope.$watch('appConfigs', (_appConfigs) => {
            if (_appConfigs.features && !_appConfigs.features.products.list) {
                $state.go('home');
            }
        }, true);

        $ctrl.funds.unshift({
            id: null,
            name: 'Alle budgetten',
        });

        let fund = $ctrl.funds.filter(fund => {
            return fund.id == $stateParams.fund_id;
        })[0] || $ctrl.funds[0];

        $ctrl.form = FormBuilderService.build({
            q: $stateParams.q || '',
            product_category_id: $stateParams.product_category_id || null,
            fund: fund,
        });

        $ctrl.showModalFilters = $stateParams.show_menu;
        $ctrl.display_type = $stateParams.display_type
        $ctrl.productCategories.unshift({
            name: 'Selecteer categorie...',
            id: null
        });

        $ctrl.updateFiltersUsedCount();
    };

    $scope.scrolled = false;
    var prevScrollpos = window.pageYOffset;

    $scope.setScrolled = function() {
        var currentScrollPos = window.pageYOffset;
        if (prevScrollpos > currentScrollPos || currentScrollPos <= 0) {
            $scope.scrolled = false;
        } else {
           $scope.scrolled = true;
        }
        prevScrollpos = currentScrollPos;
    }
    window.addEventListener('scroll', $scope.setScrolled)

    $ctrl.$onDestroy = function() {};
};

module.exports = {
    bindings: {
        funds: '<',
        products: '<',
        productCategories: '<',
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