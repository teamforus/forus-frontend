let OrganizationsEditComponent = function(
    $state,
    $rootScope,
    $stateParams,
    OrganizationService,
    FormBuilderService,
    MediaService
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
                $rootScope.$broadcast('auth:update');
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
            });
        });

        if ($ctrl.organization && $ctrl.organization.logo) {
            MediaService.read($ctrl.organization.logo.uid).then((res) => {
                $ctrl.media = res.data.data;
            });
        }
    };

    $ctrl.selectPhoto = (e) => {
        MediaService.store('organization_logo', e.target.files[0]).then(function(res) {
            $ctrl.media = res.data.data;
            $ctrl.form.values.media_uid = $ctrl.media.uid;
        });
    };

    $ctrl.cancel = function () {
        if($ctrl.organization)
            $state.go('offices', {'organization_id' : $ctrl.organization.id});
        else
            $state.go('organizations');
    };
};

module.exports = {
    bindings: {
        organization: '<',
        productCategories: '<'
    },
    controller: [
        '$state', 
        '$rootScope', 
        '$stateParams', 
        'OrganizationService', 
        'FormBuilderService', 
        'MediaService', 
        OrganizationsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/organizations-edit.html'
};