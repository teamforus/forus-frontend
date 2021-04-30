let SearchItemsListDirective = function(
    $scope,
) {
    let $dir = $scope.$dir = {};

    let blockClasses = {
        'budget.grid': 'block-products',
        'subsidies.grid': 'block-subsidies',
        'budget.list': 'block-products-list',
        'subsidies.list': 'block-subsidies-list',
    };
    
    const init = () => {
        $dir.products = $scope.items || [];
        $dir.display = $scope.display || 'grid';
        $dir.type = $scope.type || 'budget';
        $dir.blockClass = blockClasses[[$dir.type, $dir.display].join('.')];

        $scope.$watch('items', (value) => $dir.products = value);
    };

    init();
};

module.exports = () => {
    return {
        scope: {
            display: '@',
            type: '@',
            items: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            SearchItemsListDirective
        ],
        templateUrl: 'assets/tpl/directives/search-items-list.html'
    };
};