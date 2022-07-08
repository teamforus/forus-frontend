const ImplementationCmsEditComponent = function(
    $rootScope,
    MediaService,
    ModalService,
    FormBuilderService,
    ImplementationService,
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

    const bannerOpacityOptions = [1, 2, 3, 4, 5, 6, 7, 9, 10].map((option) => ({
        value: (option * 10).toString(),
        label: ((10 - option) * 10) + '%',
    }));

    $ctrl.modelPlaceholder = '';
    $ctrl.bannerMedia;
    $ctrl.resetMedia = false;

    $ctrl.bannerMeta = null;

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

    $ctrl.communicationTypes = [{
        value: '1',
        label: 'Je/jouw',
    }, {
        value: '0',
        label: 'U/uw',
    }];

    $ctrl.announcementTypes = [{
        id: 'warning',
        label: 'warning',
    }, {
        id: 'danger',
        label: 'danger'
    }, {
        id: 'success',
        label: 'success'
    }, {
        id: 'primary',
        label: 'primary'
    }, {
        id: 'default',
        label: 'default'
    }];

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

    $ctrl.blockAlignmentOnChange = (direction, values, field) => {
        values[field] = direction;
    };

    $ctrl.$onInit = () => {
        const { informal_communication } = $ctrl.implementation;

        $ctrl.bannerMeta = $ctrl.getBannerMetaDefault();
        $ctrl.page_types = $ctrl.implementation.page_types;
        $ctrl.page_types_internal = $ctrl.implementation.page_types_internal;
        $ctrl.implementation.informal_communication = informal_communication ? '1' : '0';
        $ctrl.initialCommunicationType = informal_communication;

        $ctrl.bannerMedia = $ctrl.implementation.banner;
        $ctrl.bannerMeta.media = $ctrl.implementation.banner;
        $ctrl.bannerMeta.overlay_type = $ctrl.implementation.overlay_type;
        $ctrl.bannerMeta.overlay_enabled = $ctrl.implementation.overlay_enabled;
        $ctrl.bannerMeta.overlay_opacity = $ctrl.implementation.overlay_opacity.toString();

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
            ...{
                announcement: $ctrl.implementation.announcement || {
                    type: $ctrl.announcementTypes[0].id,
                    expire_at: null,
                    active: false,
                },
                implementation_blocks: [],
                pages: $ctrl.preparePages($ctrl.implementation),
                media_uid: [],
            }
        };

        if (values.announcement.expire_at) {
            values.announcement.expire_at = moment(values.announcement.expire_at, 'YYYY-MM-DD').format('DD-MM-YYYY');
        }

        $ctrl.form = FormBuilderService.build(values, (form) => {
            const submit = () => {
                const { overlay_enabled, overlay_type, overlay_opacity } = $ctrl.bannerMeta;
                const header_text_color = $ctrl.bannerMeta.auto_text_color ? 'auto' : $ctrl.bannerMeta.header_text_color;

                if (!$ctrl.has_announcement) {
                    delete form.values.announcement;
                } else if (values.announcement.expire_at) {
                    form.values.announcement.expire_at = moment(form.values.announcement.expire_at, 'DD-MM-YYYY').format('YYYY-MM-DD');
                }

                if ($ctrl.resetMedia && $ctrl.form.values.banner_media_uid) {
                    MediaService.delete($ctrl.form.values.banner_media_uid).then(() => { }, (res) => {
                        PushNotificationsService.danger('Error, could not delete banner image!', res.data.message);
                    });
                }

                ImplementationService.updateCMS($rootScope.activeOrganization.id, $ctrl.implementation.id, {
                    ...form.values,
                    ...{ overlay_enabled, overlay_type, overlay_opacity, header_text_color }
                }).then(() => {
                    delete form.values.banner_media_uid;
                    Object.keys(form.values.pages).forEach((pageKey) => form.values.pages[pageKey].media_uid = []);

                    form.errors = [];
                    form.values.media_uid = [];

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
        implementation: '<',
    },
    controller: [
        '$rootScope',
        'MediaService',
        'ModalService',
        'FormBuilderService',
        'ImplementationService',
        'PushNotificationsService',
        ImplementationCmsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-cms-edit.html'
};
