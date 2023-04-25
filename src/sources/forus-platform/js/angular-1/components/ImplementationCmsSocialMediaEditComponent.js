const ImplementationCmsSocialMediaEditComponent = function (
    $filter,
    ModalService,
    PushNotificationsService,
    ImplementationSocialMediaService,
) {
    const $ctrl = this;

    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate(`modals.danger_zone.remove_implementation_social_media.${key}`);

    $ctrl.filters = {
        per_page: 15,
    };

    $ctrl.onPageChange = (query = {}) => {
        ImplementationSocialMediaService.list(
            $ctrl.organization.id,
            $ctrl.implementation.id,
            query,
        ).then((res) => $ctrl.socialMedias = res.data);
    };

    $ctrl.editSocialMedia = (socialMedia = null) => {
        ModalService.open('editSocialMediaComponent', {
            usedTypes: $ctrl.socialMedias.data.map((socialMedia) => socialMedia.type),
            organization: $ctrl.organization,
            implementation: $ctrl.implementation,
            implementationSocialMedia: socialMedia,
            onChange: () => $ctrl.onPageChange($ctrl.filters),
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
                ImplementationSocialMediaService.destroy(
                    $ctrl.organization.id,
                    $ctrl.implementation.id,
                    socialMedia.id,
                ).then(() => {
                    PushNotificationsService.success('Opgeslagen!');
                    $ctrl.onPageChange();
                }, (res) => PushNotificationsService.danger('Error!', res?.data?.message));
            },
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.onPageChange($ctrl.filters);
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
        ImplementationCmsSocialMediaEditComponent,
    ],
    templateUrl: 'assets/tpl/pages/implementation-cms-social-media-edit.html',
};
