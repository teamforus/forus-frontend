const ProductsListDirective = function($scope) {
    const $dir = $scope.$dir = {};

    const blockClasses = {
        'budget.grid': 'block-products',
        'subsidies.grid': 'block-subsidies',
        'budget.list': 'block-products-list',
        'subsidies.list': 'block-subsidies-list',
    };

    const init = () => {
        $dir.favouritesOnly = $scope.favouritesOnly || false;
        $dir.onToggleFavourite = $scope.onToggleFavourite;
        $dir.type = $scope.type || 'budget';
        $dir.display = $scope.display || 'grid';
        $dir.products = $scope.products || [];
        $dir.blockClass = blockClasses[[$dir.type, $dir.display].join('.')];
    };

    $scope.$watch('products', (value, old) => (old && value != old) && init());
    $scope.$watch('display', (value, old) => (old && value != old) && init());
    $scope.$watch('type', (value, old) => (old && value != old) && init());

    init();
};

module.exports = () => {
    return {
        scope: {
            favouritesOnly: '=',
            onToggleFavourite: '&',
            type: '=',
            display: '=',
            products: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            ProductsListDirective
        ],
        templateUrl: 'assets/tpl/directives/products-list.html'
    };
};