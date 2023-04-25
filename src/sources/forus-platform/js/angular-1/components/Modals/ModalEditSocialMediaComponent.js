const ModalEditSocialMediaComponent = function (
    FormBuilderService,
    PushNotificationsService,
    ImplementationSocialMediaService,
) {
    const $ctrl = this;

    const socialMediaTypes = [{
        key: null,
        name: 'Select type',
    }, {
        key: 'facebook',
        name: 'Facebook',
    }, {
        key: 'twitter',
        name: 'Twitter',
    }, {
        key: 'youtube',
        name: 'Youtube',
    }];

    $ctrl.buildForm = (onSubmit) => {
        const { type = null, url = '', title = '' } = ($ctrl.implementationSocialMedia || {});

        return FormBuilderService.build({ type, url, title }, (form) => {
            const promise = $ctrl.implementationSocialMedia ? ImplementationSocialMediaService.update(
                $ctrl.organization.id,
                $ctrl.implementation.id,
                $ctrl.implementationSocialMedia.id,
                form.values,
            ) : ImplementationSocialMediaService.store(
                $ctrl.organization.id,
                $ctrl.implementation.id,
                form.values,
            );

            promise.then(() => {
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.close();
                onSubmit();
            }, (res) => {
                PushNotificationsService.danger('Error!', res?.data?.message);
                form.errors = res.data.errors;
            })
        });
    }

    $ctrl.$onInit = () => {
        const { organization, implementation, implementationSocialMedia, usedTypes } = $ctrl.modal.scope;

        $ctrl.organization = organization;
        $ctrl.implementation = implementation;
        $ctrl.implementationSocialMedia = implementationSocialMedia;
        
        $ctrl.socialMediaTypes = socialMediaTypes.filter((type) => {
            return !usedTypes.includes(type.key) || type.key == implementationSocialMedia?.type;
        });

        $ctrl.form = $ctrl.buildForm($ctrl.modal.scope.onChange);
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'FormBuilderService',
        'PushNotificationsService',
        'ImplementationSocialMediaService',
        ModalEditSocialMediaComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-edit-social-media.html',
};