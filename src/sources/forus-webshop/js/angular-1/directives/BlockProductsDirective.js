let BlockProductsDirective = function($scope) {
    $scope.$dir = {
        display: $scope.display || 'grid',
        type: $scope.type || 'budget',
        filters: $scope.filters || 'budget',
        products: $scope.products || [],
        showLoadMore: $scope.showLoadMore || true,
        titleAlignDir: $scope.titleAlignDir || 'center',
    };
};

module.exports = () => {
    return {
        scope: {
            filters: '=?',
            display: '@',
            type: '@',
            titleAlignDir: '@',
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
