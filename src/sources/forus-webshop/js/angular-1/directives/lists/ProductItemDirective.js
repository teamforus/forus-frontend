const { productsMenu } = require("../../config/flags");

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
    $dir.enableFavourites = $scope.enableFavourites;
    $dir.productImgSrc = $dir.media ? ($dir.media.sizes.small || $dir.media.sizes.thumbnail) : './assets/img/placeholders/product-small.png';

    $dir.lowestPrice = $scope.product.price_type === 'regular' ? Math.min(
        parseFloat($scope.product.price), parseFloat($scope.product.price_min)
    ) : null;

    $dir.favouritesOnly = $scope.favouritesOnly;

    $dir.toggleFavourite = ($event) => {
        $event.preventDefault();
        $event.stopPropagation();

        $dir.product.is_favourite = !$dir.product.is_favourite;

        if ($dir.product.is_favourite) {
            ProductService.setAsFavourite($dir.product.id).then(() => {
                let favourites_count = $scope.products.filter(product => product.is_favourite == true).length;
                let description = 'Nu heb je ' + favourites_count + ' producten in je favorieten';

                PushNotificationsService.bookmark($dir.product.name, description, $dir.productImgSrc, {
                    timeout: 8000,
                    btnText: 'Ga naar favorieten',
                    btnSref: 'favourite-products',
                    btnIcon: 'cards-heart-outline',
                    bookmarkId: $dir.product.id
                });
            });
        } else {
            ProductService.removeFavourite($dir.product.id);
            PushNotificationsService.success(`${$dir.product.name} was removed from favourites!`);
        }
        
        $scope.onToggleFavourite();
    };
};

module.exports = () => {
    return {
        scope: {
            enableFavourites: '=',
            favouritesOnly: '=',
            onToggleFavourite: '&',
            product: '=',
            products: '=',
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
