const ImplementationCmsConfigEditComponent = function (
    FormBuilderService,
    ImplementationService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.configs = [{
        page: 'home',
        blocks: [
            'show_home_map',
            'show_home_products',
        ],
    }, {
        page: 'providers',
        blocks: [
            'show_providers_map',
        ],
    }, {
        page: 'provider',
        blocks: [
            'show_provider_map',
        ],
    }, {
        page: 'office',
        blocks: [
            'show_office_map',
        ],
    }];

    $ctrl.$onInit = function() {
        $ctrl.form = FormBuilderService.build({
            show_home_map: $ctrl.implementation.show_home_map,
            show_home_products: $ctrl.implementation.show_home_products,
            show_provider_map: $ctrl.implementation.show_provider_map,
            show_providers_map: $ctrl.implementation.show_providers_map,
            show_office_map: $ctrl.implementation.show_office_map,
        }, function(form) {
            ImplementationService.updateCMS($ctrl.organization.id, $ctrl.implementation.id, form.values).then(() => {
                PushNotificationsService.success('Opgeslagen!');
            }, (res) => {
                PushNotificationsService.danger('Error!', res.data.message);
                form.errors = res.data.errors;
            }).finally(() => form.unlock());
        }, true);
    };
};

module.exports = {
    bindings: {
        organization: '<',
        implementation: '<',
    },
    controller: [
        'FormBuilderService',
        'ImplementationService',
        'PushNotificationsService',
        ImplementationCmsConfigEditComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-cms-config-edit.html'
};
