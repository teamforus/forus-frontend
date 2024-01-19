const ProductItemDirective = function (
    $scope,
    ProductService,
) {
    const $dir = $scope.$dir;

    const getProductPrice = (product, productType) => {
        if (productType == 'subsidies') {
            if (product.price_type === 'regular' && product.price_min == 0) {
                return 'Gratis';
            }

            if (product.price_type === 'regular' && product.price_min != 0) {
                return product.price_min_locale;
            }

            if (product.price_type !== 'regular') {
                return product.price_locale;
            }
        }

        return product.price_locale;
    }

    $dir.toggleBookmark = ($event) => {
        $event.preventDefault();
        $event.stopPropagation();

        ProductService.toggleBookmark($dir.product);
        $dir?.onToggleBookmark({ product: $dir.product });
    };

    $dir.$onInit = () => {
        $dir.productPrice = getProductPrice($dir.product, $dir.productType);
    }
};

module.exports = () => {
    return {
        scope: {
            onToggleBookmark: '&',
            product: '=',
            productType: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'ProductService',
            ProductItemDirective,
        ],
        templateUrl: ($el, $attr) => {
            return 'assets/tpl/directives/lists/products/' + ($attr.template || 'product-item-list') + '.html'
        }
    };
};
