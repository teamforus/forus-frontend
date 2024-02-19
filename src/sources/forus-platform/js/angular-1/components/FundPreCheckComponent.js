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
        key: false,
        name: `Uitgeschakeld`,
    }, {
        key: true,
        name: `Actief`,
    }];

    $ctrl.bannerStates = [{
        value: 'draft',
        name: 'Nee',
    }, {
        value: 'public',
        name: 'Ja',
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

    const buildBannerForm = () => {
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
        }, true)
    };

    const buildPreCheckForm = () => {
        $ctrl.preCheckForm = FormBuilderService.build({
            pre_check_enabled: $ctrl.implementation.pre_check_enabled,
            pre_check_title: $ctrl.implementation.pre_check_title,
            pre_check_description: $ctrl.implementation.pre_check_description,
            implementation_id: $ctrl.implementation.id,
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

    const makeRecordSettingsData = (record_settings) => {
        $ctrl.funds.data.forEach(fund => {
            let record_setting = record_settings.find(record_setting => record_setting.fund_id == fund.id);

            if (!record_setting) {
                record_settings.push({
                    implementation_name: fund.implementation.name,
                    implementation_url_webshop: fund.implementation.url_webshop,
                    fund_id: fund.id,
                    fund_name: fund.name,
                    fund_logo: fund.logo,
                    description: '',
                    impact_level: 0,
                    is_knock_out: false,
                });
            }
        });

        return record_settings;
    };

    const transformPreChecks = (preChecks) => {
        return preChecks.map((preCheck) => ({
            ...preCheck,
            record_types: preCheck.record_types.map((recordType) => {
                return { 
                    ...recordType,
                    record_settings: makeRecordSettingsData(recordType.record_settings || [])
                };
            }),
        }));
    };

    const loadPreChecks = () => {
        PreCheckService.list($ctrl.organization.id, $ctrl.implementation.id).then((res) => {
            $ctrl.preChecks = res.data.data;
            $ctrl.preChecks = transformPreChecks($ctrl.preChecks);
        });
    };

    $ctrl.updateImplementation = (id) => {
        $ctrl.implementation = $ctrl.implementations.find((implementation) => implementation.id == id);
        $ctrl.thumbnailMedia = $ctrl.implementation?.pre_check_banner;
        $ctrl.mediaFile = null;

        buildBannerForm();
        buildPreCheckForm();
        loadPreChecks();
    };

    $ctrl.$onInit = function () {
        if ($ctrl.implementations.length > 0) {
            $ctrl.updateImplementation($ctrl.implementations[0]?.id);
        }
    };
};

module.exports = {
    bindings: {
        funds: '<',
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