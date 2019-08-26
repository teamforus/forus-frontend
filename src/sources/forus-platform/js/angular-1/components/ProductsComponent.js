let ProductsComponent = function(
    $state, 
    $stateParams,
    appConfigs,
    ModalService
) {
    let $ctrl = this;

    $ctrl.maxProductCount = appConfigs.flags.maxProductCount ? appConfigs.flags.maxProductCount : null;

    $ctrl.$onInit = function() {
        $ctrl.emptyBlockLink = $state.href('products-create', $stateParams);
        $ctrl.cardLevel = "list";
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
        '$state', 
        '$stateParams',
        'appConfigs',
        'ModalService',
        ProductsComponent
    ],
    templateUrl: 'assets/tpl/pages/products.html'
};