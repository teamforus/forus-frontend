let BlockProductsDirective = function($scope) {
    $scope.query = {
        product_category_id: null,
        search: ""
    };

    if ($scope.productCategories.filter(category => {
        return category.id == null;
    }).length == 0) {
        $scope.productCategories.unshift({
            name: 'Selecteer categorie...',
            id: null
        });
    }

    $scope.updateProducts = query => {
        $scope.shownProducts = $scope.products.filter(product => {
            if (query.product_category_id !== null) {
                if (product.id != query.product_category_id) {
                    return false;
                }
            }

            if (product.name.indexOf(query.search) == -1) {
                return false;
            }

            return true;
        });
    };

    $scope.$watch('query', $scope.updateProducts, true);
    $scope.updateProducts($scope.query);
};

module.exports = () => {
    return {
        scope: {
            products: "=",
            productCategories: "=",
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