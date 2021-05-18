let SearchResultComponent = function(
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
            order_by_dir: 'asc',
        }
    }, {
        label: 'Nieuwe eerst',
        value: {
            order_by: 'created_at',
            order_by_dir: 'desc',
        }
    }];

    // Search by resource type
    $ctrl.searchItemTypes = [{
        label: 'Potjes',
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

    $ctrl.sort_by = $ctrl.sortByOptions[$ctrl.sortByOptions.length - 1];

    $ctrl.setOrderDropdown = ($event, show) => {
        $event.stopPropagation();
        $event.preventDefault();

        $ctrl.showOrderDropdown = show;
    };

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

    $ctrl.sortBy = ($event, sort_by) => {
        $event.preventDefault();
        $event.stopPropagation();

        $ctrl.sort_by = sort_by;
        $ctrl.showOrderDropdown = false;

        $ctrl.onPageChange({ ...$ctrl.filters });
    };

    $ctrl.buildQuery = (values) => {
        const orderByValue = {
            ...$ctrl.sort_by.value,
            ...{ order_by: $ctrl.sort_by.value.order_by }
        };

        return {
            q: values.q,
            organization_id: values.organization_id,
            fund_id: values.fund ? values.fund.id : null,
            product_category_id: values.product_category_id,
            overview: 0,
            page: values.page,
            search_item_types: values.search_item_types.filter((i) => i),
            display_type: $ctrl.display_type,
            ...orderByValue
        };
    };

    $ctrl.onPageChange = (values) => {
        $ctrl.doSearch($ctrl.buildQuery(values));
    };

    $ctrl.doSearch = (query) => {
        SearchService.search(query).then((res) => {
            $ctrl.searchItems = res.data;
            $ctrl.updateState(query);
            $ctrl.updateFiltersUsedCount();
        });
    };

    $ctrl.updateState = (query, notify = false) => {
        const stateParams = { ...query, ...{ search_item_types: query.search_item_types.join(',') } };

        $state.transitionTo($state.$current.name, stateParams, { notify });
    };

    $ctrl.updateFiltersUsedCount = () => {
        console.log($ctrl.filters);
        $ctrl.countFiltersApplied = Object.values($ctrl.filters).reduce((count, filter) => count + (filter ? (
            typeof filter == 'object' ? (filter.id || Array.isArray(filter) ? filter.length : 0) : 1
        ) : 0), 0) - 3;
    };

    $rootScope.$on('search-query', (e, data) => {
        $ctrl.filters.q = data;
    });

    $ctrl.$onInit = () => {
        const { q, overview, fund_id, organization_id, product_category_id, page } = $stateParams;
        const search_item_types = ($stateParams.search_item_types || '').split(',').filter((i) => i);

        $ctrl.showOrderDropdown = false;
        $ctrl.display_type = $stateParams.display_type;

        $ctrl.funds.unshift({
            id: null,
            name: 'Alle potjes',
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
            ...{ q, overview, fund_id, organization_id, product_category_id, search_item_types, page },
            ...$ctrl.sort_by.value,
            fund: $ctrl.funds.filter(fund => fund.id === fund_id)[0] || $ctrl.funds[0],
        };

        $ctrl.lastStateParams = {...$ctrl.filters};
        $ctrl.updateFiltersUsedCount();
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
        '$rootScope',
        '$state',
        '$stateParams',
        'SearchService',
        SearchResultComponent
    ],
    templateUrl: 'assets/tpl/pages/search-result.html'
};