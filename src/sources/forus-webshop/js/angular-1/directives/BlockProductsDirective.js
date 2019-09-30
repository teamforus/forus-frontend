let BlockProductsDirective = function(
    $state,
    $scope,
    AuthService,
    FundService,
    RecordService,
    ProductService,
    VoucherService,
    ProductCategoryService
) {
    let $dir = {
        requestProducts: true
    };

    $scope.$dir = $dir;
    $scope.recordsByKey = {};
    $scope.vouchers = [];

    $scope.filters = {
        product_category_id: null,
        q: ""
    };

    $scope.eligibilityStateColors = {
        'valid': 'success',
        'missing': 'danger',
        'partial': 'warning',
        'taken': 'hidden',
    };

    $scope.onReset = (query) => {
        ProductService.list(query).then((res => {
            $scope.products = res.data;
            $scope.recheckEligibility();
        }));
    };

    $scope.onLoadMore = (query) => {
        ProductService.list(query).then((res => {
            $scope.products.data = $scope.products.data.concat(res.data.data);
            $scope.products.meta = res.data.meta;
            $scope.recheckEligibility();
        }));
    };

    $scope.recheckEligibility = () => {
        $scope.products.data.forEach($scope.processProduct);
    };

    $scope.fetchAheadOfTime = (filters, filtersOld) => {
        return filters.product_category_id != filtersOld.product_category_id;
    };

    $scope.processProduct = (product) => {
        let state = 'missing';
        let taken = $scope.vouchers.filter(
            voucher => voucher.product.id == product.id
        ).length > 0

        if ($scope.authUser) {
            state = taken ? 'taken' : FundService.demoCheckProductEligibilityState(
                $scope.recordsByKey,
                product
            );
        }

        product.eligibilityState = state;
    };

    $scope.applyForProduct = (product) => {
        FundService.apply(product.funds[product.funds.length - 1].id).then(res => {
            VoucherService.makeProductVoucher(res.data.data.address, product.id).then(res => {
                $state.go('voucher', {
                    address: res.data.data.address
                });
            });
        });
    };

    $scope.loadProducts = () => {
        if ($scope.sample) {
            ProductService.sample().then((res) => $scope.products = res.data);
        } else {
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
        }
    };

    $scope.onInit = () => {
        if ($scope.authUser = AuthService.hasCredentials()) {
            VoucherService.list().then(res => {
                $scope.vouchers = res.data.data;
                $scope.loadProducts();
            });

            RecordService.list().then(function(res) {
                $scope.records = res.data;
                $scope.records.forEach(function(record) {
                    if (!$scope.recordsByKey[record.key]) {
                        $scope.recordsByKey[record.key] = [];
                    }

                    $scope.recordsByKey[record.key].push(record);
                });
            });
        } else {
            $scope.loadProducts();
        }
    };

    $scope.onInit();
};

module.exports = () => {
    return {
        scope: {
            sample: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$state',
            '$scope',
            'AuthService',
            'FundService',
            'RecordService',
            'ProductService',
            'VoucherService',
            'ProductCategoryService',
            BlockProductsDirective
        ],
        templateUrl: 'assets/tpl/directives/block-products.html'
    };
};