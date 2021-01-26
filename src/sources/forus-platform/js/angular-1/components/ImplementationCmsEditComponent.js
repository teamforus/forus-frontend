let ImplementationCmsEditComponent = function(
    $rootScope,
    FormBuilderService,
    ImplementationService,
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.implementation.informal_communication =
            $ctrl.implementation.informal_communication ? '1' : '0';

        $ctrl.form = FormBuilderService.build($ctrl.implementation, (form) => {
            ImplementationService.updateCMS(
                $rootScope.activeOrganization.id,
                $ctrl.implementation.id,
                form.values
            ).then(res => {
                form.unlock();
                form.errors = [];
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
        '$rootScope',
        'FormBuilderService',
        'ImplementationService',
        'PushNotificationsService',
        ImplementationCmsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-cms-edit.html'
};