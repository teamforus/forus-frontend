let ProductCardDirective = function(
    $scope, 
    $state,
    $filter,
    FundService,
    ProductService,
    ModalService
) {
    let $translate = $filter('translate');

    let trans_product_edit = (key) => {
        return $translate('product_edit.labels.' + key);
    };
    
    $scope.productFunds = $scope.product.funds;

    $scope.product.description_amount = $scope.product.unlimited_stock ? 
        trans_product_edit('unlimited') : $scope.product.stock_amount;

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
                ).then((res) => {
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
            '$filter',
            'FundService',
            'ProductService',
            'ModalService',
            ProductCardDirective
        ],
        templateUrl: 'assets/tpl/directives/product-card.html' 
    };
};