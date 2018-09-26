let ProductsComponent = function(
    $state,
    $rootScope,
    $timeout,
    CredentialsService,
    IdentityService,
    AuthService,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        
    };
};

module.exports = {
    bindings: {
        products: '<',
        productCategories: '<'
    },
    controller: [
        '$state',
        '$rootScope',
        '$timeout',
        'CredentialsService',
        'IdentityService',
        'AuthService',
        'appConfigs',
        ProductsComponent
    ],
    templateUrl: 'assets/tpl/pages/products.html'
};