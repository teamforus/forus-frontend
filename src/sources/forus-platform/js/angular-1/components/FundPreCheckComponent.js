const FundPreCheckComponent = function (
    $q,
    MediaService,
    PreCheckService,
    FormBuilderService,
    ImplementationService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.mediaFile = null;

    $ctrl.enableOptions = [{
        key: 0,
        name: `Disabled`,
    }, {
        key: 1,
        name: `Enabled`,
    }];

    $ctrl.bannerStates = [{
        value: 'draft',
        name: 'Draft',
    }, {
        value: 'public',
        name: 'Public',
    }];

    $ctrl.steps = [];

    $ctrl.selectPhoto = (file) => {
        $ctrl.mediaFile = file;
        $ctrl.deleteMedia = false;
    };

    $ctrl.resetPhoto = () => {
        $ctrl.mediaFile = null;
        $ctrl.deleteMedia = true;
    };

    $ctrl.storeMedia = function (mediaFile) {
        PageLoadingBarService.setProgress(0);

        return $q(async (resolve, reject) => {
            if ($ctrl.deleteMedia) {
                await MediaService.delete($ctrl.implementation.email_logo.uid);
            }

            if (mediaFile) {
                return MediaService.store('pre_check_banner', mediaFile).then(
                    (res) => resolve(res.data.data),
                    (res) => {
                        PushNotificationsService.danger('Error!', res.data?.message || 'Onbekende foutmelding!');
                        reject(res);
                    },
                );
            }

            resolve(null);
        }).finally(() => PageLoadingBarService.setProgress(100));
    }

    $ctrl.$onInit = function () {
        $ctrl.implementation = $ctrl.implementations.data[0];
        $ctrl.thumbnailMedia = $ctrl.implementation?.pre_check_banner;

        if (!$ctrl.implementation) {
            return;
        }

        $ctrl.bannerForm = FormBuilderService.build({
            pre_check_banner_state: $ctrl.implementation.pre_check_banner_state,
            pre_check_banner_label: $ctrl.implementation.pre_check_banner_label,
            pre_check_banner_title: $ctrl.implementation.pre_check_banner_title,
            pre_check_banner_description: $ctrl.implementation.pre_check_banner_description,
        }, (form) => {
            $ctrl.storeMedia($ctrl.mediaFile).then((media) => {
                ImplementationService.updatePreCheckBanner($ctrl.organization.id, $ctrl.implementation.id, {
                    ...form.values,
                    ...(media ? { pre_check_media_uid: media.uid } : {})
                }).then(() => {
                    form.errors = null;
                    PushNotificationsService.success('Opgeslagen!');
                }, (res) => {
                    form.errors = res.data.errors;
                    PushNotificationsService.danger(res.data?.message || 'Onbekende foutmelding!');
                }).finally(() => form.unlock());
            });
        }, true);

        $ctrl.preCheckForm = FormBuilderService.build({
            pre_check_enabled: $ctrl.implementation.pre_check_enabled,
            pre_check_title: $ctrl.implementation.pre_check_title,
            pre_check_description: $ctrl.implementation.pre_check_description,
        }, (form) => {
            PreCheckService.sync($ctrl.organization.id, $ctrl.implementation.id, {
                ...form.values,
                pre_checks: $ctrl.preChecks
            }).then(() => {
                form.errors = null;
                PushNotificationsService.success('Opgeslagen!');

                ImplementationService.read($ctrl.organization.id, $ctrl.implementation.id).then((res) => {
                    $ctrl.implementation = res.data.data;
                });
            }, (res) => {
                form.errors = res.data.errors;
                PushNotificationsService.danger(res.data?.message || 'Onbekende foutmelding!');
            }).finally(() => form.unlock());
        }, true);
    };
};

module.exports = {
    bindings: {
        funds: '<',
        preChecks: '<',
        organization: '<',
        implementations: '<',
    },
    controller: [
        '$q',
        'MediaService',
        'PreCheckService',
        'FormBuilderService',
        'ImplementationService',
        'PageLoadingBarService',
        'PushNotificationsService',
        FundPreCheckComponent,
    ],
    templateUrl: 'assets/tpl/pages/fund-pre-check.html',
};