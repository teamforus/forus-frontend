const SearchResultComponent = function(
    $rootScope,
    $state,
    $stateParams,
    SearchService
) {
    const $ctrl = this;

    $ctrl.results = null;
    $ctrl.resultsExists = false;
    $ctrl.searchItems = {};
    $ctrl.formItems = [];

    // Search direction
    $ctrl.sortByOptions = [{
        label: 'Oudste eerst',
        value: {
            order_by: 'created_at',
            order_dir: 'asc',
        }
    }, {
        label: 'Nieuwe eerst',
        value: {
            order_by: 'created_at',
            order_dir: 'desc',
        }
    }];

    // Search by resource type
    $ctrl.searchItemTypes = [{
        label: 'Tegoeden',
        key: 'funds',
        checked: ($stateParams.search_item_types || []).includes('funds')
    }, {
        label: 'Aanbod',
        key: 'products',
        checked: ($stateParams.search_item_types || []).includes('products')
    }, {
        label: 'Aanbieders',
        key: 'providers',
        checked: ($stateParams.search_item_types || []).includes('providers')
    }];

    $ctrl.setMobileMenu = ($event, show) => {
        $event.stopPropagation();
        $event.preventDefault();

        $ctrl.showModalFilters = show;
        $ctrl.updateState($ctrl.buildQuery($ctrl.filters));
    };

    $ctrl.toggleType = ($event, type) => {
        $event.preventDefault();
        $event.stopPropagation();

        const index = $ctrl.filters.search_item_types.indexOf(type);

        if (index === -1) {
            $ctrl.filters.search_item_types.push(type);
        } else {
            $ctrl.filters.search_item_types.splice(index, 1);
        }
    }

    $ctrl.showAs = (display_type) => {
        $ctrl.display_type = display_type;
        $ctrl.updateState($ctrl.buildQuery($ctrl.filters));
    };

    $ctrl.updateSortBy = () => {
        $ctrl.filters = { ...$ctrl.filters, ...$ctrl.sortBy.value };
        $ctrl.updateState({ ...$ctrl.filters });
    };

    $ctrl.buildQuery = (values = {}) => {
        return {
            q: values.q,
            order_by: values.order_by,
            fund_id: values.fund_id,
            order_dir: values.order_dir,
            organization_id: values.organization_id,
            product_category_id: values.product_category_id,
            overview: 0,
            page: values.page,
            search_item_types: values.search_item_types.filter((i) => i),
            display_type: $ctrl.display_type,
        };
    };

    $ctrl.doSearch = (query, stateParams) => {
        return SearchService.search(query).then((res) => {
            $ctrl.searchItems = $ctrl.transformItems(res.data, stateParams);
            $ctrl.updateFiltersUsedCount();
        });
    };

    $ctrl.onPageChange = (values) => {
        $ctrl.updateState({ ...$ctrl.buildQuery($ctrl.filters), ...{ page: values.page } });
    };

    $ctrl.transformItems = function(items, stateParams) {
        return {
            ...items,
            ...{ data: items.data.map((item) => ({ ...item, ...{ searchData: stateParams } })) }
        };
    };

    $ctrl.getStateParams = (query) => {
        return { ...query, ...{ search_item_types: query.search_item_types.join(',') } };
    };

    $ctrl.updateState = (query) => {
        const stateParams = $ctrl.getStateParams(query);

        $ctrl.doSearch(query, stateParams).then(() => {
            $state.transitionTo($state.$current.name, stateParams, { notify: false, location: 'replace', reload: false });
        });
    };

    $ctrl.updateFiltersUsedCount = () => {
        $ctrl.countFiltersApplied = Object.values($ctrl.filters).reduce((count, filter) => count + (filter ? (
            typeof filter == 'object' ? (filter.id || Array.isArray(filter) ? filter.length : 0) : 1
        ) : 0), 0) - 3;
    };

    $rootScope.$on('search-query', (e, data) => {
        $ctrl.filters.q = data;
    });

    $ctrl.$onInit = () => {
        const { q, overview, fund_id, organization_id, product_category_id, page, order_by, order_dir } = $stateParams;
        const search_item_types = ($stateParams.search_item_types || '').split(',').filter((i) => i);
        const stateParams = { q, overview, fund_id, organization_id, product_category_id, search_item_types, page, order_by, order_dir };

        $ctrl.display_type = $stateParams.display_type;

        $ctrl.funds.unshift({
            id: null,
            name: 'Selecteer tegoeden...',
        });

        $ctrl.organizations.unshift({
            name: 'Selecteer aanbieders...',
            id: null
        });

        $ctrl.productCategories.unshift({
            name: 'Selecteer categorie...',
            id: null
        });

        $ctrl.filters = {
            ...stateParams,
            with_external: 1,
            fund: $ctrl.funds.filter(fund => fund.id === fund_id)[0] || $ctrl.funds[0],
        };

        $ctrl.sortBy = $ctrl.sortByOptions.filter((option) => {
            return option.value.order_by == $ctrl.filters.order_by &&
                option.value.order_dir == $ctrl.filters.order_dir;
        })[0];

        $ctrl.searchItems = $ctrl.transformItems(
            $ctrl.searchItems,
            $ctrl.getStateParams($ctrl.buildQuery($ctrl.filters))
        );

        $ctrl.updateFiltersUsedCount();
    };
};

module.exports = {
    bindings: {
        funds: '<',
        vouchers: '<',
        searchItems: '<',
        organizations: '<',
        productCategories: '<',
    },
    controller: [
        '$rootScope',
        '$state',
        '$stateParams',
        'SearchService',
        SearchResultComponent
    ],
    templateUrl: 'assets/tpl/pages/search-result.html'
};