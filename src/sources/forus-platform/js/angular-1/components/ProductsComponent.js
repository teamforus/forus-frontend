let ProductsComponent = function(
    $q,
    $scope,
    $state, 
    $stateParams,
    appConfigs,
    ProductService,
    ModalService
) {
    let $ctrl = this;
    $ctrl.filters = {
        values: {},
    };

    $ctrl.maxProductCount = appConfigs.flags.maxProductCount ? appConfigs.flags.maxProductCount : null;
    
    $scope.onPageChange = async (query) => {
        return $q((resolve, reject) => {
            ProductService.list(
                $ctrl.organization.id, 
                Object.assign({}, query, $ctrl.filters.values)
            ).then((res => {
                $ctrl.products = {
                    meta: res.data.meta,
                    data: res.data.data,
                };

                resolve($ctrl.products);
            }), reject);
        });
    };

    $ctrl.$onInit = function() {
        $scope.onPageChange().then(() => {
            $ctrl.emptyBlockLink = $state.href('products-create', $stateParams);
            $ctrl.cardLevel = "list";
        });
    };

    $ctrl.addProduct = function () {

        if($ctrl.maxProductCount && $ctrl.products.length >= $ctrl.maxProductCount){
            ModalService.open('modalNotification', {
                type: 'danger',
                title: 'product_edit.errors.already_added',
                icon: 'product-error'
            });
        }else{
            $state.go('products-create', {
                organization_id: $stateParams.organization_id
            });
        }
    };
};

module.exports = {
    bindings: {
        organization: '<',
        products: '<'
    },
    controller: [
        '$q',
        '$scope',
        '$state', 
        '$stateParams',
        'appConfigs',
        'ProductService',
        'ModalService',
        ProductsComponent
    ],
    templateUrl: 'assets/tpl/pages/products.html'
};