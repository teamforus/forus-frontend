const SearchItemsListDirective = function($scope, ProductService) {
    const $dir = $scope.$dir = {};

    const transformProductAlternativeText = (product) => {
        return ProductService.transformProductAlternativeText(product);
    };

    const init = () => {
        $dir.type = $scope.type || 'budget';
        $dir.display = $scope.display || 'grid';
        $dir.vouchers = $scope.vouchers || [];

        $dir.items = ($scope.items || []).map((item) => {
            if (item.description_text) {
                const el = document.createElement('div');

                el.innerHTML = item.description_text;
                item.description = el.innerText;

                if (item.description.length > 120) {
                    item.description = item.description.slice(0, 106) + '...';
                }

                item.resource.description = item.description;
            }

            if (item.item_type == 'product') {
                item.resource.alternative_text = transformProductAlternativeText(item.resource);
            }

            return item;
        });
    };

    $scope.$watch('vouchers', (value, old) => (old && value != old) && init());
    $scope.$watch('display', (value, old) => (old && value != old) && init());
    $scope.$watch('items', (value, old) => (old && value != old) && init());
    $scope.$watch('type', (value, old) => (old && value != old) && init());

    init();
};

module.exports = () => {
    return {
        scope: {
            type: '=',
            items: '=',
            display: '=',
            vouchers: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'ProductService',
            SearchItemsListDirective
        ],
        templateUrl: 'assets/tpl/directives/search-items-list.html'
    };
};