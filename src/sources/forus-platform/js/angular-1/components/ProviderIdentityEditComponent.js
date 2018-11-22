let ProviderIdentityEditComponent = function(
    $state,
    $stateParams,
    ProviderIdentityService,
    FormBuilderService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        let values = ProviderIdentityService.apiResourceToForm(
            $ctrl.providerIdentity || {}
        );

        $ctrl.form = FormBuilderService.build(values, (form) => {
            let promise;

            form.lock();

            if ($ctrl.providerIdentity) {
                promise = ProviderIdentityService.update(
                    $stateParams.organization_id,
                    $stateParams.id,
                    form.values
                )
            } else {
                promise = ProviderIdentityService.store(
                    $stateParams.organization_id,
                    form.values
                )
            }

            promise.then((res) => {
                $state.go('provider-identities', {
                    organization_id: $stateParams.organization_id
                });
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
            });
        });
    };

    $ctrl.cancel = function () {
        $state.go('provider-identities', {'organization_id' : $stateParams.organization_id});
    };
};

module.exports = {
    bindings: {
        providerIdentity: '<'
    },
    controller: [
        '$state', 
        '$stateParams', 
        'ProviderIdentityService', 
        'FormBuilderService', 
        ProviderIdentityEditComponent
    ],
    templateUrl: 'assets/tpl/pages/provider-identity-edit.html'
};