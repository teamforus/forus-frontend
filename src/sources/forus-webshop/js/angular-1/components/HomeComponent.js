const HomeComponent = function (
    $sce,
    $state,
    appConfigs,
    ModalService,
    AuthService,
    VoucherService
) {
    const $ctrl = this;

    $ctrl.appConfigs = appConfigs;
    $ctrl.implementation_name = appConfigs.features.implementation_name;

    $ctrl.digidAvailable = appConfigs.features.digid;
    $ctrl.openInMeModal = () => ModalService.open('modalOpenInMe');

    if (AuthService.hasCredentials()) {
        VoucherService.list().then(res => $ctrl.vouchers = res.data.data);
    } else {
        $ctrl.vouchers = [];
    }

    $ctrl.$onInit = () => {
        const { digid_error, session_expired } = $state.params;

        if (digid_error) {
            return $state.go('error', { errorCode: 'digid_' + digid_error });
        }

        if (appConfigs.features.banner) {
            $ctrl.headerStyle = {
                'background-image': 'url("' + appConfigs.features.banner.sizes.large + '")',
            };
        };

        $ctrl.overlayStyles = { opacity: $ctrl.appConfigs.features.settings.overlay_opacity };

        if ($ctrl.appConfigs.features.settings.overlay_type != 'color') {
            $ctrl.overlayStyles['background-image'] = 'url("/assets/img/banner-patterns/' + $ctrl.appConfigs.features.settings.overlay_type + '.svg")';
        }

        $ctrl.description_html = $sce.trustAsHtml(appConfigs.features.settings.description_html);

        $ctrl.show_products = appConfigs.features.implementation_configs.find(config => {
            return config.page_key == 'homepage' && config.page_config_key == "show_products"
        }).is_active;

        $ctrl.show_map = appConfigs.features.implementation_configs.find(config => {
            return config.page_key == 'homepage' && config.page_config_key == "show_map"
        }).is_active;

        if (session_expired) {
            ModalService.open('modalNotification', {
                type: 'confirm',
                description: 'modal.logout.description',
                confirmBtnText: 'Inloggen',
                confirm: () => $state.go('start', {}, { reload: true }),
            });
        }
    };
};

module.exports = {
    bindings: {
        funds: '<',
        products: '<',
        subsidies: '<',
    },
    scope: {
        text: '=',
        button: '=',
    },
    controller: [
        '$sce',
        '$state',
        'appConfigs',
        'ModalService',
        'AuthService',
        'VoucherService',
        HomeComponent,
    ],
    templateUrl: 'assets/tpl/pages/home.html'
};
