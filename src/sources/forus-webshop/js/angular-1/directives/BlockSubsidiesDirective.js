let BlockSubsidiesDirective = async function(
    $scope,
    ProductService,
    ProductCategoryService
) {
    $scope.filters = {
        product_category_id: null,
        q: "",
        fund_type: 'subsidies',
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
        ProductService.sample(Object.assign(($scope.fund ? {
            fund_id: $scope.fund.id,
        } : {}), {
            fund_type: 'subsidies',
        })).then((res) => {
            $scope.products = res.data;
        });
    } else {
        ProductService.list({
            fund_type: 'subsidies',
        }).then((res => {
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
            BlockSubsidiesDirective
        ],
        templateUrl: 'assets/tpl/directives/block-subsidies.html'
    };
};
