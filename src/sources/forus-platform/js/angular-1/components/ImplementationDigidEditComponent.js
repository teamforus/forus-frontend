let ImplementationDigidEditComponent = function(
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
        ImplementationDigidEditComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-digid-edit.html'
};