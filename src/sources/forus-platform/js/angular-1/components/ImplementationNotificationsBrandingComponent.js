const ImplementationNotificationsBrandingComponent = function(
    $q,
    $state,
    MediaService,
    FormBuilderService,
    ImplementationService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.mediaFile = null;
    $ctrl.deleteMedia = false;

    $ctrl.selectPhoto = (file) => {
        $ctrl.mediaFile = file;
        $ctrl.deleteMedia = false;
    };

    $ctrl.resetPhoto = () => {
        $ctrl.mediaFile = null;
        $ctrl.deleteMedia = true;
        $ctrl.thumbnailMedia = $ctrl.logoMediaDefault;
    };

    $ctrl.storeMedia = function(mediaFile) {
        return $q(async (resolve, reject) => {
            if ($ctrl.deleteMedia && $ctrl.logoMedia) {
                await MediaService.delete($ctrl.implementation.email_logo.uid);
            }

            if (mediaFile) {
                return MediaService.store('email_logo', mediaFile, 'thumbnail').then((res) => {
                    return resolve(res.data.data);
                }, reject);
            }

            resolve();
        });
    }

    $ctrl.$onInit = () => {
        const { email_color, email_signature, email_logo } = $ctrl.implementation;
        const { email_color_default, email_signature_default, email_logo_default } = $ctrl.implementation;

        $ctrl.logoMedia = email_logo;
        $ctrl.logoMediaDefault = email_logo_default;

        $ctrl.thumbnailMedia = $ctrl.logoMedia ? $ctrl.logoMedia : $ctrl.logoMediaDefault;
        $ctrl.defaultSignature = email_signature_default;

        $ctrl.form = FormBuilderService.build({
            email_color: email_color ? email_color : email_color_default,
            email_signature: email_signature ? email_signature : ''
        }, (form) => {
            $ctrl.storeMedia($ctrl.mediaFile).then((media) => {
                const values = form.values;
                const email_color = values.email_color ? values.email_color.toUpperCase().trim() : null;
                const email_signature = values.email_signature ? values.email_signature.trim() : null;

                ImplementationService.updateEmailBranding($ctrl.organization.id, $ctrl.implementation.id, {
                    email_color: email_color && email_color != email_color_default ? email_color : null,
                    email_signature: email_signature && email_signature != email_signature_default ? email_signature : null,
                    ...(media ? { email_logo_uid: media.uid } : {})
                }).then(() => {
                    PushNotificationsService.success('Success!', 'Email notifications branding updated!');
                    $state.go('implementation-notifications', {
                        organization_id: $ctrl.organization.id,
                    });
                }, (res) => {
                    PushNotificationsService.danger('Error!', 'Please fix validation errors and try again!');
                    form.errors = res.data.errors;
                    form.unlock();
                });
            });
        }, true);
    };
};

module.exports = {
    bindings: {
        organization: '<',
        implementation: '<',
    },
    controller: [
        '$q',
        '$state',
        'MediaService',
        'FormBuilderService',
        'ImplementationService',
        'PushNotificationsService',
        ImplementationNotificationsBrandingComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-notifications-branding.html'
};