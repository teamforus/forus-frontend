const ImplementationCmsEditComponent = function (
    $state,
    MediaService,
    ModalService,
    FormBuilderService,
    ImplementationService,
    ImplementationPageService,
    PushNotificationsService
) {
    const $ctrl = this;

    const bannerPatterns = [{
        value: 'color',
        label: 'Kleur',
    }, {
        value: 'lines',
        label: 'Lijnen',
    }, {
        value: 'points',
        label: 'Punten',
    }, {
        value: 'dots',
        label: 'Stippen',
    }, {
        value: 'circles',
        label: 'Cirkels',
    }];

    const headerTextColors = [{
        value: 'dark',
        label: 'Donker',
    }, {
        value: 'bright',
        label: 'Licht',
    }];

    const bannerOpacityOptions = [...new Array(10).keys()].map((n) => ++n).map((option) => ({
        value: (option * 10).toString(),
        label: ((10 - option) * 10) + '%',
    }));

    const communicationTypes = [{
        value: '1',
        label: 'Je/jouw',
    }, {
        value: '0',
        label: 'U/uw',
    }];

    const announcementState = [
        { value: false, label: 'Nee' },
        { value: true, label: 'Ja' },
    ];

    const announcementTypes = [
        { value: 'warning', label: 'Warning' },
        { value: 'success', label: 'Success' },
        { value: 'primary', label: 'Primary' },
        { value: 'default', label: 'Default' },
        { value: 'danger', label: 'Error' },
    ];

    const announcementExpireOptions = [
        { value: false, label: 'Nee' },
        { value: true, label: 'Ja' },
    ];

    $ctrl.announcementState = announcementState;
    $ctrl.communicationTypes = communicationTypes;
    $ctrl.announcementExpireOptions = announcementExpireOptions;

    $ctrl.bannerMedia;
    $ctrl.resetMedia = false;
    $ctrl.bannerMeta = null;

    $ctrl.announcementTypes = announcementTypes;

    $ctrl.deletePrevalidation = (page) => {
        ModalService.open('modalNotification', {
            modalClass: 'modal-md',
            type: 'confirm',
            title: 'Wilt u dit gegeven verwijderen?',
            description: [
                'Weet u zeker dat u dit gegeven wilt verwijderen? Deze actie kunt niet ongedaan maken,',
                'u kunt echter wel een nieuw gegeven aanmaken.',
            ].join(" "),
            confirm: () => {
                ImplementationPageService.destroy(
                    page.implementation.organization_id,
                    page.implementation.id,
                    page.id,
                ).then(() => {
                    $state.reload();
                    PushNotificationsService.success('Success!', 'Implementation page delete!')
                }, (res) => PushNotificationsService.danger('Error!', res.data.message));
            }
        });
    };

    $ctrl.getBannerMetaDefault = () => {
        return {
            media: null,
            auto_text_color: true,
            patterns: bannerPatterns,
            opacityOptions: bannerOpacityOptions,
            headerTextColors: headerTextColors,
            overlay_enabled: false,
            overlay_type: bannerPatterns[0].value,
            overlay_opacity: bannerOpacityOptions[4].value,
            header_text_color: headerTextColors[0].value,
        };
    };

    $ctrl.selectBanner = (mediaFile) => {
        $ctrl.bannerMeta.mediaLoading = true;

        MediaService.store('implementation_banner', mediaFile, ['thumbnail', 'medium']).then((res) => {
            $ctrl.bannerMedia = res.data.data;
            $ctrl.bannerMeta.media = $ctrl.bannerMedia;
            $ctrl.form.values.banner_media_uid = $ctrl.bannerMedia.uid;
            $ctrl.resetMedia = false;
        }, (res) => {
            PushNotificationsService.danger('Error!', res.data.message);
        }).finally(() => {
            $ctrl.bannerMeta.mediaLoading = false;
        });
    };

    $ctrl.resetBanner = () => {
        $ctrl.resetMedia = true;
        $ctrl.bannerMedia = null;
        $ctrl.bannerMeta = $ctrl.getBannerMetaDefault();
    }

    $ctrl.appendMedia = (media_uid, formValue) => {
        if (!Array.isArray(formValue.media_uid)) {
            formValue.media_uid = [];
        }

        formValue.media_uid.push(media_uid);
    };

    $ctrl.expireDateChange = (values) => {
        if (!values.announcement?.expire) {
            values.announcement.expire_at = null;
        }
    };

    $ctrl.$onInit = () => {
        const { pages, implementation } = $ctrl;
        const { informal_communication, page_types } = implementation;

        $ctrl.bannerMeta = $ctrl.getBannerMetaDefault();
        $ctrl.implementation.informal_communication = informal_communication ? '1' : '0';
        $ctrl.initialCommunicationType = informal_communication;

        $ctrl.bannerMedia = $ctrl.implementation.banner;
        $ctrl.bannerMeta.media = $ctrl.implementation.banner;
        $ctrl.bannerMeta.overlay_type = $ctrl.implementation.overlay_type;
        $ctrl.bannerMeta.overlay_enabled = $ctrl.implementation.overlay_enabled;
        $ctrl.bannerMeta.overlay_opacity = $ctrl.implementation.overlay_opacity.toString();

        $ctrl.pages = page_types.map((page_type) => {
            const page = pages.find((page) => page?.page_type == page_type.key) || {};
            const internal_only = page_type.type == 'static' || page_type.type == 'element';
            const pageData = { ...page, internal_only, page_type }

            const createPageSref = {
                organization_id: $ctrl.organization.id,
                implementation_id: $ctrl.implementation.id,
            };

            if (page.id) {
                return { ...pageData, srefProps: { ...createPageSref, id: page.id } };
            }

            return { ...pageData, srefProps: { ...createPageSref, type: page_type.key } };
        });

        if ($ctrl.implementation.header_text_color == 'auto') {
            $ctrl.bannerMeta.auto_text_color = true;
            $ctrl.bannerMeta.header_text_color = $ctrl.implementation.banner ?
                ($ctrl.implementation.banner.is_dark ? 'bright' : 'dark') : 'dark';
        } else {
            $ctrl.bannerMeta.auto_text_color = false;
            $ctrl.bannerMeta.header_text_color = $ctrl.implementation.header_text_color;
        }

        const values = {
            ...$ctrl.implementation,
            media_uid: [],
            announcement: {
                type: $ctrl.announcementTypes[0].value,
                active: $ctrl.announcementState[0].value,
                replace: false,
                title: '',
                description: '',
                expire_at: null,
                ...($ctrl.implementation.announcement || {}),
            },
        };

        values.announcement.expire = !!values.announcement.expire_at;

        $ctrl.form = FormBuilderService.build(values, (form) => {
            const submit = () => {
                const { overlay_enabled, overlay_type, overlay_opacity } = $ctrl.bannerMeta;
                const header_text_color = $ctrl.bannerMeta.auto_text_color ? 'auto' : $ctrl.bannerMeta.header_text_color;

                if ($ctrl.resetMedia && $ctrl.form.values.banner_media_uid) {
                    MediaService.delete($ctrl.form.values.banner_media_uid).then(() => { }, (res) => {
                        PushNotificationsService.danger('Error, could not delete banner image!', res.data.message);
                    });
                }

                ImplementationService.updateCMS($ctrl.organization.id, $ctrl.implementation.id, {
                    ...form.values,
                    ...{ overlay_enabled, overlay_type, overlay_opacity, header_text_color }
                }).then(() => {
                    delete form.values.banner_media_uid;

                    form.errors = [];
                    form.values.media_uid = [];
                    form.values.announcement.replace = false;

                    PushNotificationsService.success('Opgeslagen!');
                }, (res) => form.errors = res.data.errors).finally(() => form.unlock());
            };

            if ($ctrl.initialCommunicationType != form.values.informal_communication) {
                return ModalService.open("dangerZone", {
                    title: "Aanspreekvorm veranderd!",
                    description_text: [
                        `U heeft de aanspreekvorm veranderd voor de '${$ctrl.implementation.name}' webshop.\n`,
                        `Dit heeft ook invloed op de templates van de e-mailberichten, pushberichten en webberichten.\n`,
                        `Weet u zeker dat u wilt doorgaan?`
                    ].join(''),
                    cancelButton: "Annuleren",
                    confirmButton: "Bevestigen",
                    text_align: "center",
                    onConfirm: () => submit(),
                    onCancel: () => form.unlock(),
                });
            }

            submit();
        }, true);
    };
};

module.exports = {
    bindings: {
        organization: '<',
        implementation: '<',
        pages: '<',
    },
    controller: [
        '$state',
        'MediaService',
        'ModalService',
        'FormBuilderService',
        'ImplementationService',
        'ImplementationPageService',
        'PushNotificationsService',
        ImplementationCmsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-cms-edit.html'
};
