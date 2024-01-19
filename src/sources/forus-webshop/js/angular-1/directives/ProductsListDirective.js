const ProductsListDirective = function($scope) {
    const $dir = $scope.$dir = {};

    const blockClasses = () => ({
        'budget.grid': `block-products${$dir.large ? ' block-products-lg' : ''}`,
        'subsidies.grid': `block-products${$dir.large ? ' block-products-lg' : ''}`,

        'budget.list': 'block-products-list',
        'subsidies.list': 'block-products-list',
    });

    const init = () => {
        $dir.onToggleBookmark = $scope.onToggleBookmark;
        $dir.type = $scope.type || 'budget';
        $dir.large = $scope.large || false;
        $dir.display = $scope.display || 'grid';
        $dir.products = $scope.products || [];
        $dir.blockClass = blockClasses()[[$dir.type, $dir.display].join('.')];
    };

    $scope.$watch('products', (value, old) => (old && value != old) && init());
    $scope.$watch('display', (value, old) => (old && value != old) && init());
    $scope.$watch('type', (value, old) => (old && value != old) && init());

    init();
};

module.exports = () => {
    return {
        scope: {
            onToggleBookmark: '&',
            type: '=',
            display: '=',
            large: '=',
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