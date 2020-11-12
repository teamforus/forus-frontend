let ProductsDirective = function(
    $scope,
) {
    let $ctrl = this;

    $ctrl.showMoreProducts = () => {
        $ctrl.shownProductsCount += 9;
        $ctrl.sliceProducts();
    };

    $ctrl.showLessProducts = () => {
        $ctrl.shownProductsCount -= 9;
        $ctrl.sliceProducts();
    };

    $ctrl.sliceProducts = () => {
        $ctrl.shownProducts = $ctrl.products.slice(0, $ctrl.shownProductsCount);
    };
    
    $ctrl.$onInit = () => {
        if ($ctrl.products) {
            $ctrl.shownProductsCount = 3;
            $ctrl.shownProducts = $ctrl.products.slice(0, $ctrl.shownProductsCount);
        }
    };
};

module.exports = () => {
    return {
        scope: {
            products: '='
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            ProductsDirective
        ],
        templateUrl: 'assets/tpl/directives/products.html'
    };
};