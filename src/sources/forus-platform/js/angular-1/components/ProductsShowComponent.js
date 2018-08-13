let ProductsShowComponent = function(
    $state, 
    $stateParams, 
    ProductService, 
    FormBuilderService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.cardLevel = "show";
    };
};

module.exports = {
    bindings: {
        product: '<'
    },
    controller: [
        '$state', 
        '$stateParams', 
        'ProductService', 
        'FormBuilderService', 
        ProductsShowComponent
    ],
    templateUrl: 'assets/tpl/pages/products-show.html'
};