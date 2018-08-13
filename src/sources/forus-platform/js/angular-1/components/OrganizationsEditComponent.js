let OrganizationsEditComponent = function(
    $state,
    $stateParams,
    OrganizationService,
    FormBuilderService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        let values = $ctrl.organization ? OrganizationService.apiResourceToForm(
            $ctrl.organization
        ) : {
            "product_categories": []
        };

        $ctrl.form = FormBuilderService.build(values, (form) => {
            let promise;

            form.lock();

            if ($ctrl.organization) {
                promise = OrganizationService.update(
                    $stateParams.organization_id,
                    form.values
                )
            } else {
                promise = OrganizationService.store(
                    form.values
                )
            }

            promise.then((res) => {
                $state.go('organizations');
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
            });
        });
    };
};

module.exports = {
    bindings: {
        organization: '<',
        productCategories: '<'
    },
    controller: [
        '$state', 
        '$stateParams', 
        'OrganizationService', 
        'FormBuilderService', 
        OrganizationsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/organizations-edit.html'
};