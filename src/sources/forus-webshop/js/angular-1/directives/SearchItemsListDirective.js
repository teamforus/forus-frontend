let SearchItemsListDirective = function(
    $scope,
    $state,
) {
    let $dir = $scope.$dir = {};

    let blockClasses = {
        'budget.grid': 'block-products',
        'subsidies.grid': 'block-subsidies',
        'budget.list': 'block-products-list',
        'subsidies.list': 'block-subsidies-list',
    };

    $scope.goToSearchItem = (item) => {
        switch (item.item_type) {
            case 'product':
                $state.go('products-show', {id: item.id});
                break;
        
            case 'fund':
                $state.go('fund', {id: item.id});
                break;

            case 'provider':
                $state.go('provider', {provider_id: item.id});
                break;
        }        
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
            '$state',
            SearchItemsListDirective
        ],
        templateUrl: 'assets/tpl/directives/search-items-list.html'
    };
};