let SignUpComponent = function(
    $state,
    $rootScope,
    $stateParams,
    OrganizationService,
    IdentityService,
    CredentialsService,
    FormBuilderService,
    MediaService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.form = FormBuilderService.build({
            pin_code: "1111",
        }, function(form) {
            form.lock();

            IdentityService.make(form.values).then((res) => {
                CredentialsService.set(res.data.access_token);
                $state.go('organizations-create');
            }, (res) => {
                form.unlock();
                form.errors = res.data.errors;
            });
        });
    };
};

module.exports = {
    controller: [
        '$state', 
        '$rootScope', 
        '$stateParams', 
        'OrganizationService', 
        'IdentityService', 
        'CredentialsService', 
        'FormBuilderService', 
        'MediaService', 
        SignUpComponent
    ],
    templateUrl: 'assets/tpl/pages/sign-up.html'
};