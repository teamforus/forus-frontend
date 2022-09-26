const BookmarkedProductsComponent = function(
    $state,
    ProductService,
) {
    const $ctrl = this;

    $ctrl.display_type = 'list';
    $ctrl.sortByOptions = ProductService.getSortOptions();

    $ctrl.showAs = (display_type) => {
        $ctrl.display_type = display_type;
        $ctrl.updateState();
    };

    $ctrl.updateSortBy = () => {
        $ctrl.onPageChange();
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
            page: values.page,
            display_type: $ctrl.display_type,
            bookmarked: 1,
            ...orderByValue
        };
    };

    $ctrl.onPageChange = (values) => {
        $ctrl.loadProducts($ctrl.buildQuery(values));
    };

    $ctrl.loadProducts = (query) => {
        ProductService.list(query).then((res) => {
            return $ctrl.products = res.data;
        }).finally(() => {
            $ctrl.updateState(query);
        });
    };

    $ctrl.updateState = (query = {}, location = 'replace') => {
        $state.go('bookmarked-products', {
            display_type: $ctrl.display_type,
        }, { location });
    };

    $ctrl.$onInit = () => {
        $ctrl.sort_by = $ctrl.sortByOptions[0];
        $ctrl.display_type = $state.params.display_type;
    };
}

module.exports = {
    bindings: {
        products: '<',
    },
    controller: [
        '$state',
        'ProductService',
        BookmarkedProductsComponent,
    ],
    templateUrl: 'assets/tpl/pages/bookmarked-products.html',
};