const ProductsComponent = function(
    $scope,
    $state,
    $stateParams,
    $sce,
    appConfigs,
    FormBuilderService,
    ProductService
) {
    const $ctrl = this;

    $ctrl.sortByOptions = [{
        label: 'Nieuwe eerst',
        value: {
            order_by: 'created_at',
            order_by_dir: 'desc',
        }
    }, {
        label: 'Oudste eerst',
        value: {
            order_by: 'created_at',
            order_by_dir: 'asc',
        }
    }, {
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
        label: 'Meest gewild',
        value: {
            order_by: 'most_popular',
            order_by_dir: 'desc',
        }
    }];

    $ctrl.distances = [
        { id: null, name: 'Overal' },
        { id: 3, name: '< 3 km' },
        { id: 5, name: '< 5 km' },
        { id: 10, name: '< 10 km' },
        { id: 15, name: '< 15 km' },
        { id: 25, name: '< 25 km' },
        { id: 50, name: '< 50 km' },
        { id: 75, name: '< 75 km' }
    ];

    $ctrl.filtersList = [
        'q', 'product_category_id', 'fund', 'sortBy',
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

    $ctrl.showAs = (display_type) => {
        $ctrl.display_type = display_type;
        $ctrl.updateState($ctrl.buildQuery($ctrl.form.values));
    };

    $ctrl.updateSortBy = () => {
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
            page: values.page,
            fund_id: values.fund_id,
            organization_id: values.organization_id,
            product_category_id: values.product_category_id,
            display_type: $ctrl.display_type,
            fund_type: $ctrl.fund_type,
            postcode: values.postcode || '',
            distance: values.distance || null,
            ...orderByValue
        };
    };

    $ctrl.onPageChange = (values) => {
        $ctrl.loadProducts($ctrl.buildQuery(values));
    };

    $ctrl.loadProducts = (query, location = 'replace') => {
        ProductService.list({ ...{ fund_type: $ctrl.type }, ...query }).then((res) => {
            return $ctrl.products = res.data;
        });

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
            show_menu: $ctrl.showModalFilters,
            postcode: query.postcode,
            distance: query.distance,
        }, { location });
    };

    $ctrl.updateFiltersUsedCount = () => {
        let count = 0;

        $ctrl.form.values.q && count++;
        $ctrl.form.values.organization_id && count++;
        $ctrl.form.values.product_category_id && count++;
        $ctrl.form.values.fund && $ctrl.form.values.fund.id && count++;
        $ctrl.countFiltersApplied = count;
    };

    $ctrl.$onInit = () => {
        $ctrl.showModalFilters = $stateParams.show_menu;
        $ctrl.appConfigs = appConfigs;

        $ctrl.sort_by = $ctrl.sortByOptions[0];
        $ctrl.fund_type = $stateParams.fund_type;
        $ctrl.display_type = $stateParams.display_type;

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

        $ctrl.form = FormBuilderService.build({
            q: $stateParams.q || '',
            fund_id: $stateParams.fund_id || null,
            organization_id: $stateParams.organization_id || null,
            product_category_id: $stateParams.product_category_id || null,
            postcode: $stateParams.postcode,
            distance: $stateParams.distance,
        });

        $ctrl.updateFiltersUsedCount();

        $scope.$watch('$ctrl.appConfigs', (_appConfigs) => {
            if (_appConfigs.features && !_appConfigs.features.products.list) {
                $state.go('home');
            }
        }, true);

        let blocks = appConfigs.features.pages.products.blocks;

        blocks.forEach(block => {
            block.description_html_trusted = $sce.trustAsHtml(block.description_html || '');
        });

        $ctrl.description_above_product_list = blocks.find(block => {
            return block.key == 'above_product_list';
        }).description_html_trusted;
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
        '$sce',
        'appConfigs',
        'FormBuilderService',
        'ProductService',
        ProductsComponent
    ],
    templateUrl: 'assets/tpl/pages/products.html'
};