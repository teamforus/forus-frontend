let BlockProductsDirective = async function(
    $scope,
    ProductService,
    ProductCategoryService
) {
    $scope.filters = {
        product_category_id: null,
        q: ""
    };

    $scope.onReset = async (query) => {
        ProductService.list(query).then((res => {
            $scope.products = res.data;
        }));
    };

    $scope.onLoadMore = async (query) => {
        ProductService.list(query).then((res => {
            $scope.products.data = $scope.products.data.concat(res.data.data);
            $scope.products.meta = res.data.meta;
        }));
    };

    $scope.fetchAheadOfTime = (filters, filtersOld) => {
        return filters.product_category_id != filtersOld.product_category_id;
    };

    if ($scope.sample) {
        ProductService.sample($scope.fund ? {
            fund_id: $scope.fund.id
        } : {}).then((res) => $scope.products = res.data);
    } else {
        ProductService.list().then((res => {
            $scope.products = res.data.data;

            ProductCategoryService.list({
                parent_id: 'null',
                used: 1,
            }).then(res => {
                $scope.productCategories = res.data.data;
                $scope.onReset($scope.filters);
    
                if ($scope.productCategories.filter(category => {
                        return category.id == null;
                    }).length == 0) {
                    $scope.productCategories.unshift({
                        name: 'Selecteer categorie...',
                        id: null
                    });
                }
            });
        }));
    }
};

module.exports = () => {
    return {
        scope: {
            sample: '=',
            fund: '=?',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'ProductService',
            'ProductCategoryService',
            BlockProductsDirective
        ],
        templateUrl: 'assets/tpl/directives/block-products.html'
    };
};
