const ImplementationCmsSocialMediaEditComponent = function (
    $filter,
    ModalService,
    PushNotificationsService,
    ImplementationSocialMediaService,
) {
    const $ctrl = this;

    let $translate = $filter('translate');
    let $translateDangerZone = (key) => $translate(
        'modals.danger_zone.remove_implementation_social_media.' + key
    );

    $ctrl.socialMedias = [];

    $ctrl.getSocialMedias = () => {
        ImplementationSocialMediaService.list($ctrl.organization.id, $ctrl.implementation.id).then(res => {
            $ctrl.socialMedias = res.data.data;
        });
    };

    $ctrl.addSocialMedia = () => {
        ModalService.open('editSocialMediaComponent', {
            onSubmit: (form, modal) => {
                ImplementationSocialMediaService.store($ctrl.organization.id, $ctrl.implementation.id, form.values).then(res => {
                    PushNotificationsService.success('Opgeslagen!');
                    modal.close();
                    $ctrl.getSocialMedias();
                }, (res) => {
                    PushNotificationsService.danger('Error!', res.data.message);
                    form.errors = res.data.errors;
                });
            }
        });
    };

    $ctrl.editSocialMedia = (socialMedia) => {
        ModalService.open('editSocialMediaComponent', {
            socialMediaType: socialMedia.type,
            socialMediaLink: socialMedia.link,
            socialMediaTitle: socialMedia.title,
            onSubmit: (form, modal) => {
                ImplementationSocialMediaService.update($ctrl.organization.id, $ctrl.implementation.id, socialMedia.id, form.values).then(res => {
                    PushNotificationsService.success('Opgeslagen!');
                    modal.close();
                    $ctrl.getSocialMedias();
                }, (res) => {
                    PushNotificationsService.danger('Error!', res.data.message);
                    form.errors = res.data.errors;
                });
            }
        });
    };

    $ctrl.deleteSocialMedia = (socialMedia) => {
        ModalService.open('dangerZone', {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            text_align: 'center',
            onConfirm: () => {
                ImplementationSocialMediaService.destroy($ctrl.organization.id, $ctrl.implementation.id, socialMedia.id).then((res) => {
                    PushNotificationsService.success('Opgeslagen!');
                    $ctrl.getSocialMedias();
                }, (res) => PushNotificationsService.danger('Error!', res?.data?.message));
            },
        });
    }; 

    $ctrl.$onInit = function() {
        $ctrl.getSocialMedias();
    };
};

module.exports = {
    bindings: {
        organization: '<',
        implementation: '<',
    },
    controller: [
        '$filter',
        'ModalService',
        'PushNotificationsService',
        'ImplementationSocialMediaService',
        ImplementationCmsSocialMediaEditComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-cms-social-media-edit.html'
};
