const ProductItemDirective = function(
    $scope,
    ProductService,
    PushNotificationsService,
) {
    const $dir = $scope.$dir = {};

    $dir.hasBudgetFunds = $scope.product.funds.filter((fund) => fund.type === 'budget').length > 0;
    $dir.hasActionFunds = $scope.product.funds.filter((fund) => fund.type === 'subsidies').length > 0;
    $dir.hasBothFundTypes = $dir.hasBudgetFunds && $dir.hasActionFunds;

    $dir.media = $scope.product.photo || $scope.product.logo || null;
    $dir.product = $scope.product;
    $dir.productType = $scope.productType;

    $dir.lowestPrice = $scope.product.price_type === 'regular' ? Math.min(
        parseFloat($scope.product.price), parseFloat($scope.product.price_min)
    ) : null;

    $dir.favouritesOnly = $scope.favouritesOnly;

    $dir.toggleFavourite = ($event, product) => {
        $event.preventDefault();
        $event.stopPropagation();

        product.is_favourite = !product.is_favourite;
        if (product.is_favourite) {
            ProductService.setAsFavourite(product.id);
            PushNotificationsService.success(`Succes! ${product.name} added to favourites!`);
        } else {
            ProductService.removeFavourite(product.id);
            PushNotificationsService.success(`${product.name} was removed from favourites!`);
        }
        
        $scope.onToggleFavourite();
    };
};

module.exports = () => {
    return {
        scope: {
            favouritesOnly: '=',
            onToggleFavourite: '&',
            product: '=',
            productType: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'ProductService',
            'PushNotificationsService',
            ProductItemDirective
        ],
        templateUrl: ($el, $attr) => {
            return 'assets/tpl/directives/lists/products/' + ($attr.template || 'product-item-list') + '.html'
        }
    };
};
