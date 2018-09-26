let ProductComponent = function(
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
        product: '<'
    },
    controller: [
        '$state',
        '$rootScope',
        '$timeout',
        'CredentialsService',
        'IdentityService',
        'AuthService',
        'appConfigs',
        ProductComponent
    ],
    templateUrl: 'assets/tpl/pages/product.html'
};