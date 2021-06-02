const ProductItemDirective = function($scope) {
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
};

module.exports = () => {
    return {
        scope: {
            product: '=',
            productType: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            ProductItemDirective
        ],
        templateUrl: ($el, $attr) => {
            return 'assets/tpl/directives/lists/products/' + ($attr.template || 'product-item-list') + '.html'
        }
    };
};
