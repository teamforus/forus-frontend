let ImplementationCmsEditComponent = function(
    $rootScope,
    FormBuilderService,
    ImplementationService,
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.modelPlaceholder = '';

    $ctrl.appendMedia = (media_uid, formValue) => {
        if (!Array.isArray(formValue.media_uid)) {
            formValue.media_uid = [];
        }

        formValue.media_uid.push(media_uid);
    };

    $ctrl.preparePages = (implementation) => {
        const { pages, page_types, page_types_internal } = implementation;

        return page_types.reduce((pagesValue, page_type) => {
            pagesValue[page_type] = pages[page_type] ? pages[page_type] : {
                external: false,
                external_url: '',
                content: '',
                content_html: '',
            }

            if (page_types_internal.includes(page_type)) {
                pagesValue[page_type].external = false;
            }

            if (!Array.isArray(!pagesValue[page_type].media_uid)) {
                pagesValue[page_type].media_uid = [];
            }

            return pagesValue;
        }, {});
    }

    $ctrl.$onInit = () => {
        const { title, description, description_html } = $ctrl.implementation;

        $ctrl.page_types = $ctrl.implementation.page_types;
        $ctrl.page_types_internal = $ctrl.implementation.page_types_internal;
        $ctrl.markdownPreview = description;

        $ctrl.form = FormBuilderService.build({
            ...{ title, description, description_html, informal_communication, },
            ...{
                pages: $ctrl.preparePages($ctrl.implementation),
                informal_communication: $ctrl.implementation.informal_communication ? '1' : '0',
                media_uid: [],
            }
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