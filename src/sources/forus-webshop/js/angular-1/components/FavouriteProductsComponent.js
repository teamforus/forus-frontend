let FavouriteProductsComponent = function(
    ProductService,
) {
    const $ctrl = this;

    $ctrl.display_type = 'list';

    $ctrl.sortByOptions = ProductService.getSortOptions();

    $ctrl.showAs = (display_type) => {
        $ctrl.display_type = display_type;
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
            display_type: $ctrl.display_type,
            favourites_only: 1,
            ...orderByValue
        };
    };

    $ctrl.onPageChange = (values) => {
        $ctrl.loadProducts($ctrl.buildQuery(values));
    };

    $ctrl.loadProducts = (query) => {
        ProductService.list(query).then((res) => {
            return $ctrl.products = res.data.data;
        });
    };

    $ctrl.toggleFavourite = () => {
        $ctrl.productsCount = $ctrl.products.filter(product => product.is_favourite).length;
    };

    $ctrl.$onInit = () => {
        $ctrl.productsCount = $ctrl.products.length;
        $ctrl.sort_by = $ctrl.sortByOptions[0];
    };
}

module.exports = {
    bindings: {
        products: '<',
    },
    controller: [
        'ProductService',
        FavouriteProductsComponent
    ],
    templateUrl: 'assets/tpl/pages/favourite-products.html'
};