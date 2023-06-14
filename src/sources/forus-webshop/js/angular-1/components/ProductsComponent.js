const ProductsComponent = function (
    $scope,
    $state,
    $stateParams,
    appConfigs,
    ProductService,
    FormBuilderService,
    PageLoadingBarService,
    ProductCategoryService,
) {
    const $ctrl = this;

    $ctrl.sortByOptions = ProductService.getSortOptions();

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

    $ctrl.onToggleBookmark = () => {
        if ($ctrl.form.values.bookmarked) {
            $ctrl.onPageChange($ctrl.form.values);
        }
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

    $ctrl.showAs = (display_type) => {
        $ctrl.display_type = display_type;
        $ctrl.updateState($ctrl.buildQuery($ctrl.form.values));
    };

    $ctrl.updateSortBy = () => {
        $ctrl.onPageChange({ ...$ctrl.form.values });
    };

    $ctrl.buildQuery = (values = {}) => {
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
            bookmarked: values.bookmarked ? 1 : 0,
            ...orderByValue
        };
    };

    $ctrl.onPageChange = (values) => {
        $ctrl.loadProducts($ctrl.buildQuery(values));
    };

    $ctrl.loadProducts = (query) => {
        PageLoadingBarService.setProgress(0);

        ProductService.list({ ...{ fund_type: $ctrl.type }, ...query }).then((res) => {
            $ctrl.products = res.data;
        }).finally(() => {
            $ctrl.updateState(query, true);
            $ctrl.updateFiltersUsedCount();
        });
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
            bookmarked: query.bookmarked,
            order_by: query.order_by,
            order_by_dir: query.order_by_dir,
        }, { location });
    };

    $ctrl.changeCategory = (type) => {
        if (type === 'category') {
            if ($ctrl.product_category_id) {
                ProductCategoryService.list({
                    parent_id: $ctrl.product_category_id, 
                    per_page: 1000, 
                    used: 1,
                    used_type: $ctrl.fund_type,
                }).then(res => {
                    $ctrl.productSubCategories = res.data.meta.total ? [{
                        name: 'Selecteer subcategorie...',
                        id: null
                    }, ...res.data.data] : null;
                });
            } else {
                $ctrl.productSubCategories = null;
            }

            return $ctrl.form.values.product_category_id = $ctrl.product_category_id;
        }

        if (type == 'subcategory') {
            $ctrl.form.values.product_category_id = $ctrl.product_sub_category_id;
        }
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

        if ($stateParams.order_by && $stateParams.order_by_dir) {
            $ctrl.sort_by = $ctrl.sortByOptions.find(sortOption =>
                sortOption.value.order_by == $stateParams.order_by &&
                sortOption.value.order_by_dir == $stateParams.order_by_dir
            );
        } else {
            $ctrl.sort_by = $ctrl.sortByOptions[0];
        }

        $ctrl.fund_type = $stateParams.fund_type;
        $ctrl.display_type = $stateParams.display_type;
        $ctrl.product_category_id = $stateParams.product_category_id;

        $ctrl.funds.unshift({
            id: null,
            name: 'Alle tegoeden',
        });

        $ctrl.productCategories.unshift({
            name: 'Selecteer categorie...',
            id: null
        });

        $ctrl.productSubCategories?.unshift({
            name: 'Selecteer subcategorie...',
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
            bookmarked: $stateParams.bookmarked,
        });

        $ctrl.updateFiltersUsedCount();

        if ($ctrl.productCategory) {
            $ctrl.product_category_id = $ctrl.productCategory.parent_id || $ctrl.productCategory.id;
            $ctrl.product_sub_category_id = $ctrl.productCategory.parent_id ? $ctrl.productCategory.id : null;
        }

        $scope.$watch('$ctrl.appConfigs', (_appConfigs) => {
            if (_appConfigs.features && !_appConfigs.features.products.list) {
                $state.go('home');
            }
        }, true);
    };
};

module.exports = {
    bindings: {
        fund_type: '<',
        funds: '<',
        products: '<',
        productCategory: '<',
        productCategories: '<',
        productSubCategories: '<',
        organizations: '<',
    },
    controller: [
        '$scope',
        '$state',
        '$stateParams',
        'appConfigs',
        'ProductService',
        'FormBuilderService',
        'PageLoadingBarService',
        'ProductCategoryService',
        ProductsComponent,
    ],
    templateUrl: 'assets/tpl/pages/products.html',
};