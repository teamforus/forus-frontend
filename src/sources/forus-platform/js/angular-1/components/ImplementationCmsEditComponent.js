let ImplementationCmsEditComponent = function(
    $rootScope,
    FormBuilderService,
    ImplementationService,
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.modelPlaceholder = '';

    $ctrl.preparePages = (implementation) => {
        const { pages, page_types, page_types_internal } = implementation;

        return page_types.reduce((pagesValue, page_type) => {
            pagesValue[page_type] = pages[page_type] ? pages[page_type] : {
                external: false,
                external_url: '',
                content: '',
            }

            if (page_types_internal.includes(page_type)) {
                pagesValue[page_type].external = false;
            }

            return pagesValue;
        }, {});
    }

    $ctrl.$onInit = () => {
        const { informal_communication, page_types, page_types_internal } = $ctrl.implementation;

        $ctrl.page_types = page_types;
        $ctrl.page_types_internal = page_types_internal;
        $ctrl.implementation.informal_communication = informal_communication ? '1' : '0';

        $ctrl.form = FormBuilderService.build({
            ...$ctrl.implementation,
            ...{ pages: $ctrl.preparePages($ctrl.implementation) }
        }, (form) => {
            ImplementationService.updateCMS(
                $rootScope.activeOrganization.id,
                $ctrl.implementation.id,
                form.values
            ).then(() => {
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