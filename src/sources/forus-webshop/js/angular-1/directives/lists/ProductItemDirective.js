const ProductItemDirective = function (
    $scope,
    ProductService,
) {
    const $dir = $scope.$dir = {};

    $dir.hasBudgetFunds = $scope.product.funds.filter((fund) => fund.type === 'budget').length > 0;
    $dir.hasActionFunds = $scope.product.funds.filter((fund) => fund.type === 'subsidies').length > 0;
    $dir.hasBothFundTypes = $dir.hasBudgetFunds && $dir.hasActionFunds;

    $dir.media = $scope.product.photo || $scope.product.logo || null;
    $dir.product = $scope.product;
    $dir.productType = $scope.productType;
    $dir.productImgSrc = $dir.media?.sizes?.small || $dir.media?.sizes?.thumbnail || './assets/img/placeholders/product-small.png';

    $dir.lowestPrice = $scope.product.price_type === 'regular' ? Math.min(
        parseFloat($scope.product.price), parseFloat($scope.product.price_min)
    ) : null;

    $dir.toggleBookmark = ($event) => {
        $event.preventDefault();
        $event.stopPropagation();

        ProductService.toggleBookmark($dir.product);

        if (typeof $scope.onToggleBookmark == 'function') {
            $scope.onToggleBookmark({ product: $dir.product });
        }
    };
};

module.exports = () => {
    return {
        scope: {
            onToggleBookmark: '&',
            product: '=',
            productType: '=',
        },
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
