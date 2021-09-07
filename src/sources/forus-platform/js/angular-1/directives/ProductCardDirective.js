let ProductCardDirective = function(
    $scope, 
    $state,
    FundService,
    ProductService,
    ModalService
) {
    $scope.productFunds = $scope.product.funds;

    $scope.changeState = function(state) {
        FundService.changeState($scope.fund, state).then((res) => {
            $scope.fund = res.data.data;
        });
    };

    $scope.deleteProduct = function(product) {
        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'products.confirm_delete.title',
            description: 'products.confirm_delete.description',
            icon: 'product-create',
            confirm: () => {
                ProductService.destroy(
                    product.organization_id,
                    product.id
                ).then(() => {
                    $state.reload();
                });
            }
        });
    };
};

module.exports = () => {
    return {
        scope: {
            product: '=',
            level: '@'
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            'FundService',
            'ProductService',
            'ModalService',
            ProductCardDirective
        ],
        templateUrl: 'assets/tpl/directives/product-card.html' 
    };
};