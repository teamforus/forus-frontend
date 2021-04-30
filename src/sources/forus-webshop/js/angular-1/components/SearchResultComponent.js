let SearchResultComponent = function(
    $scope,
    $rootScope,
    $state,
    $stateParams,
    $timeout,
    appConfigs,
    FormBuilderService,
    SearchService
) {
    let $ctrl = this;
    let timeout = false;
    
    $ctrl.query = $stateParams.keyword;
    $ctrl.results = null; 
    $ctrl.resultsExists =false;
    $ctrl.searchItems = {};  

    $ctrl.sortByOptions = [ {
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

    $ctrl.searchItemTypes = [
        {
            label: 'Potjes',
            key: 'funds',
            checked: $stateParams.search_item_types.includes('funds') || false
        },
        {
            label: 'Aanbod',
            key: 'products',
            checked: $stateParams.search_item_types.includes('products') || false
        },
        {
            label: 'Aanbieders',
            key: 'providers',
            checked: $stateParams.search_item_types.includes('providers') || false
        },
    ];

    $ctrl.filtersList = [
        'q', 'search_item_types', 'organization_id', 'product_category_id', 'fund', 'sortBy',
    ];

    $ctrl.sort_by = $ctrl.sortByOptions[$ctrl.sortByOptions.length - 1];

    $rootScope.$on('search-query', (e, data) => {
        $ctrl.form.values.keyword = data;
    }); 

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
                order_by: $ctrl.sort_by.value.order_by,
            }
        };

        return {
            keyword: values.keyword,
            organization_id: values.organization_id,
            fund_id: values.fund ? values.fund.id : null,
            product_category_id: values.product_category_id,
            overview: true,
            page: values.page,
            search_item_types: values.search_item_types.filter((i) => i),
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

    $ctrl.loadProducts = (query) => {
        SearchService.list(query).then(res => {
            $ctrl.searchItems = res.data;
        });

        $ctrl.updateState(query, location);
        $ctrl.updateFiltersUsedCount();
    };

    $ctrl.updateSearchItemTypes = (index) => {
        let checkedTypes = $ctrl.form.values.search_item_types;
        let changedType = $ctrl.searchItemTypes[index];
        
        if (checkedTypes.includes(changedType.key) && !changedType.checked) {
            checkedTypes.splice(checkedTypes.indexOf(changedType.key), 1);
        }

        if (!checkedTypes.includes(changedType.key) && changedType.checked) {
            checkedTypes.push(changedType.key);
        }

        $ctrl.updateState($ctrl.buildQuery($ctrl.form.values));
    }

    $ctrl.updateState = (query, location = 'replace') => {
        $state.go('search-result', {
            keyword: query.keyword || '',
            page: query.page,
            display_type: query.display_type,
            fund_id: query.fund_id,
            search_item_types: query['search_item_types[]'],
            organization_id: query.organization_id,
            product_category_id: query.product_category_id,
        }, { location });        
    };

    $ctrl.updateFiltersUsedCount = () => {
        $ctrl.countFiltersApplied = Object.values(
            $ctrl.objectOnly($ctrl.form.values, $ctrl.filtersList)
        ).reduce((count, filter) => count + (filter ? (
            typeof filter == 'object' ? (filter.id || Array.isArray(filter) ? 1 : 0) : 1
        ) : 0), 0);
    };

    $ctrl.updateRows = () => {
        // $ctrl.products.data = $ctrl.products.data.map(product => {
        //     if ($ctrl.form.values.fund && $ctrl.form.values.fund.id && Array.isArray(product.funds)) {
        //         let prices = product.funds.filter(
        //             funds => funds.id == $ctrl.form.values.fund.id
        //         ).map(fund => fund.price);

        //         product.price_min = Math.min(prices);
        //         product.price_max = Math.max(prices);
        //     }

        //     return product;
        // });

        // let product_rows = [];
        // let products = $ctrl.products.data.slice().reverse();

        // while (products.length > 0) {
        //     let row = products.splice(-3);
        //     row.reverse();

        //     product_rows.push(row);
        // }

        // $ctrl.product_rows = product_rows;
    };

    $ctrl.$onInit = () => {
        $ctrl.fund_type = $stateParams.fund_type;
        $ctrl.show_order_dropdown = false;
        $ctrl.display_type = $stateParams.display_type;

        $ctrl.productCategories.unshift({
            name: 'Selecteer categorie...',
            id: null
        });
        $ctrl.organizations.unshift({
            name: 'Selecteer aanbieders...',
            id: null
        });
        $ctrl.funds.unshift({
            id: null,
            name: 'Alle potjes',
        });
            
        $scope.appConfigs = appConfigs;
        $scope.$watch('appConfigs', (_appConfigs) => {
            if (_appConfigs.features && !_appConfigs.features.products.list) {
                $state.go('home');
            }
        }, true);        
        
        $ctrl.form = FormBuilderService.build({
            keyword: $stateParams.keyword || '',
            overview: true,
            organization_id: $stateParams.organization_id || null,
            product_category_id: $stateParams.product_category_id || null,
            search_item_types: $stateParams.search_item_types || null,
            fund: null,
            ...$ctrl.sort_by.value
        });

        $ctrl.updateFiltersUsedCount();
        $ctrl.updateRows();
    };
};

module.exports = {
    bindings: {
        funds: '<',
        searchItems: '<',
        organizations: '<',
        productCategories: '<',
    },
    controller: [
        '$scope',
        '$rootScope',
        '$state',
        '$stateParams',
        '$timeout',
        'appConfigs',
        'FormBuilderService',
        'SearchService',
        SearchResultComponent
    ],
    templateUrl: 'assets/tpl/pages/search-result.html'
};