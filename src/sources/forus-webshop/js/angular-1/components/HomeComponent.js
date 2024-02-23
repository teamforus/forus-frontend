const HomeComponent = function (
    $sce,
    $state,
    appConfigs,
    ModalService,
    AuthService,
    VoucherService,
    ProductService
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

    const transformProductAlternativeText = (product) => {
        return ProductService.transformProductAlternativeText(product);
    };

    const transformProducts = (products) => {
        products.data = products.data.map(
            product => ({ ...product, ...{ alternative_text: transformProductAlternativeText(product) } })
        );
    };

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

        transformProducts($ctrl.products);
        transformProducts($ctrl.subsidies);

        $ctrl.overlayStyles = { opacity: $ctrl.appConfigs.features.settings.overlay_opacity };

        if ($ctrl.appConfigs.features.settings.overlay_type != 'color') {
            $ctrl.overlayStyles['background-image'] = 'url("/assets/img/banner-patterns/' + $ctrl.appConfigs.features.settings.overlay_type + '.svg")';
        }

        $ctrl.description_html = $sce.trustAsHtml(appConfigs.features.settings.description_html);

        if (session_expired) {
            ModalService.open('modalNotification', {
                type: 'confirm',
                title: 'Sessie verlopen',
                header: 'modal.logout.description',
                mdiIconType: 'primary',
                mdiIconClass: 'information-outline',
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
        'ProductService',
        HomeComponent,
    ],
    templateUrl: 'assets/tpl/pages/home.html'
};
