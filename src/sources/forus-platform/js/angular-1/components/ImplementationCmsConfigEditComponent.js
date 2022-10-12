const ImplementationCmsConfigEditComponent = function (
    FormBuilderService,
    ImplementationService,
    PushNotificationsService
) {
    const $ctrl = this;
    $ctrl.pages = [];

    $ctrl.$onInit = function() {
        $ctrl.implementationConfig = $ctrl.implementationConfig.map(config => {
            config.is_active = config.is_active ? true : false;
            return config;
        });

        $ctrl.pages = $ctrl.implementationConfig.map(config => config.page_key).filter(
            (value, index, self) => self.indexOf(value) === index
        );

        $ctrl.form = FormBuilderService.build({
            config: $ctrl.implementationConfig,
        }, function(form) {
            ImplementationService.updateConfig($ctrl.organization.id, $ctrl.implementation.id, form.values).then(() => {
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
        implementationConfig: '<',
    },
    controller: [
        'FormBuilderService',
        'ImplementationService',
        'PushNotificationsService',
        ImplementationCmsConfigEditComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-cms-config-edit.html'
};
