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
                $state.go('product', {id: item.id});
                break;
        
            case 'fund':
                $state.go('fund', {id: item.id});
                break;

            case 'provider':
                $state.go('provider', {id: item.id});
                break;
        }        
    };
    
    const init = () => {
        $dir.products = $scope.items || [];
        $dir.display = $scope.display || 'grid';
        $dir.type = $scope.type || 'budget';
        $dir.blockClass = blockClasses[[$dir.type, $dir.display].join('.')];

        $scope.$watch('items', (value) => {
            $dir.products = value.map((item) => {
                if (item.description_html) {
                    const el = document.createElement('div');

                    el.innerHTML = item.description_html;
                    item.description = el.innerText;

                    if (item.description.length > 120) {
                        item.description = item.description.slice(0, 106) + '...';
                    }
                }

                return item;
            });
        });
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