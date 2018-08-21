let ProductsComponent = function(
    $state, 
    $stateParams, 
    ProductService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.emptyBlockLink = $state.href('products-create', $stateParams);
        $ctrl.cardLevel = "list";
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
        'ProductService', 
        ProductsComponent
    ],
    templateUrl: 'assets/tpl/pages/products.html'
};