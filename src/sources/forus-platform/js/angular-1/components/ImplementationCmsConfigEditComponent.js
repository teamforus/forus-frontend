const ImplementationCmsConfigEditComponent = function (
    FormBuilderService,
    ImplementationService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.auto_validate_form = FormBuilderService.build({
            config: config,
        }, function(form) {
            ImplementationService.updateConfig($ctrl.organization.id, $ctrl.implementation_id, form.values).then(() => {
                PushNotificationsService.success('Opgeslagen!');
                form.unlock();
            }, () => {
                PushNotificationsService.danger('Error!');
                form.unlock();
            });
        }, true);
    };
};

module.exports = {
    bindings: {
        organization: '<',
        implementation: '<',
        config: '<',
    },
    controller: [
        'FormBuilderService',
        'ImplementationService',
        'PushNotificationsService',
        ImplementationCmsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-cms-config-edit.html'
};
