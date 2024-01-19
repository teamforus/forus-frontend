let BlockProductsDirective = function($scope) {
    $scope.$dir = {
        display: $scope.display || 'grid',
        type: $scope.type || 'budget',
        large: $scope.large || false,
        filters: $scope.filters || 'budget',
        products: $scope.products || [],
        showLoadMore: $scope.showLoadMore || true,
    };
};

module.exports = () => {
    return {
        scope: {
            large: '=?',
            filters: '=?',
            display: '@',
            type: '@',
            products: '=?',
            showLoadMore: '=?',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            BlockProductsDirective
        ],
        templateUrl: 'assets/tpl/directives/block-products.html'
    };
};
