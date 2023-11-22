const FundPreCheckComponent = function (
    $q,
    MediaService,
    PreCheckService,
    FormBuilderService,
    OrganizationService,
    ImplementationService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.mediaFile = null;
    $ctrl.stepsEditor = null;

    $ctrl.enableOptions = [{
        key: 0,
        name: `Disabled`,
    }, {
        key: 1,
        name: `Enabled`,
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

    $ctrl.storeMedia = function(mediaFile) {
        return $q(async (resolve, reject) => {
            if ($ctrl.deleteMedia) {
                await MediaService.delete($ctrl.implementation.email_logo.uid);
            }

            if (mediaFile) {
                return MediaService.store('pre_check_banner', mediaFile).then((res) => {
                    return resolve(res.data.data);
                }, reject);
            }

            resolve();
        });
    }

    $ctrl.registerStepsEditor = function(childRef) {
        $ctrl.stepsEditor = childRef;
    }

    const loadPreChecks = () => {
        return $q((resolve, reject) => {
            PreCheckService.list(
                $ctrl.organization.id,
                $ctrl.implementation.id 
            ).then((res) => resolve($ctrl.preChecks = res.data.data), reject);
        });
    };

    $ctrl.$onInit = function () {
        $ctrl.implementation = $ctrl.implementations.data[0];
        $ctrl.thumbnailMedia = $ctrl.implementation.pre_check_banner;

        loadPreChecks();

        $ctrl.bannerForm = FormBuilderService.build({
            pre_check_homepage_title: $ctrl.implementation.pre_check_homepage_title,
            pre_check_homepage_description: $ctrl.implementation.pre_check_homepage_description,
            pre_check_homepage_label: $ctrl.implementation.pre_check_homepage_label,
        }, (form) => {
            $ctrl.storeMedia($ctrl.mediaFile).then((media) => {
                ImplementationService.updatePreCheckBanner(
                    $ctrl.organization.id, 
                    $ctrl.implementation.id, {
                        ...form.values,
                        ...(media ? { pre_check_media_uid: media.uid } : {})
                    }
                ).then(() => {
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
                preChecks: $ctrl.preChecks
            }).then(() => {
                PushNotificationsService.success('Opgeslagen!');
            }, (res) => {
                form.errors = res.data.errors;
                PushNotificationsService.danger(res.data?.message || 'Onbekende foutmelding!');
            }).finally(() => form.unlock());
        }, true);
    };
};

module.exports = {
    bindings: {
        organization: '<',
        funds: '<',
        implementations: '<',
    },
    controller: [
        '$q',
        'MediaService',
        'PreCheckService',
        'FormBuilderService',
        'OrganizationService',
        'ImplementationService',
        'PushNotificationsService',
        FundPreCheckComponent,
    ],
    templateUrl: 'assets/tpl/pages/fund-pre-check.html',
};