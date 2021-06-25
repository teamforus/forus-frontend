const ProductCardDirective = function($scope) {
    $scope.$dir = { product: $scope.product };
};

module.exports = () => {
    return {
        scope: {
            product: '='
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            ProductCardDirective
        ],
        templateUrl: 'assets/tpl/directives/product-card.html'
    };
};