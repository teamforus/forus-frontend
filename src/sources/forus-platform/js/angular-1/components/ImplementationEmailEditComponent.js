let ImplementationEmailEditComponent = function(
    $state,
    $stateParams,
    $rootScope,
    FormBuilderService,
    ImplementationService,
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.form = FormBuilderService.build($ctrl.implementation, (form) => {
            ImplementationService.update(
                $rootScope.activeOrganization.id, 
                $ctrl.implementation.id,
                form.values
            ).then(res => {
                form.unlock();
                PushNotificationsService.success('Opgeslagen!');
            }, (res) => {
                form.unlock();
                form.errors = res.data.errors;
            });
        }, true);
    };
};

module.exports = {
    bindings: {
        implementation: '<',
    },
    controller: [
        '$state',
        '$stateParams',
        '$rootScope',
        'FormBuilderService',
        'ImplementationService',
        'PushNotificationsService',
        ImplementationEmailEditComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-email-edit.html'
};