let ProviderIdentitiesComponent = function(
    $state,
    $stateParams,
    ProviderIdentityService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.emptyBlockLink = $state.href('provider-identity-create', $stateParams);
    };

    $ctrl.deleteProviderIdentity = function(e, providerIdentity) {
        e.preventDefault() & e.stopPropagation();

        ProviderIdentityService.destroy(
            providerIdentity.organization_id,
            providerIdentity.id
        ).then((res) => {
            $state.reload();
        }, console.error);
    }
};

module.exports = {
    bindings: {
        providerIdentities: '<'
    },
    controller: [
        '$state',
        '$stateParams',
        'ProviderIdentityService',
        ProviderIdentitiesComponent
    ],
    templateUrl: 'assets/tpl/pages/provider-identities.html'
};