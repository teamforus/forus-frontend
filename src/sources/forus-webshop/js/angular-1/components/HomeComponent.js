let HomeComponent = function (
    $state,
    $stateParams,
    $sce,
    appConfigs,
    ModalService,
    AuthService,
    VoucherService
) {
    let $ctrl = this;

    $ctrl.appConfigs = appConfigs;
    $ctrl.implementation_name = appConfigs.features.implementation_name;

    $ctrl.digidAvailable = appConfigs.features.digid;

    if ($stateParams.confirmed) {
        return $state.go('start');
    }

    $ctrl.startFundRequest = () => {
        if ($ctrl.funds.length > 0) {
            $state.go('fund-request', {
                fund_id: $ctrl.funds[0].id
            });
        }
    };

    $ctrl.openInMeModal = () => ModalService.open('modalOpenInMe');

    if (AuthService.hasCredentials()) {
        VoucherService.list().then(res => $ctrl.vouchers = res.data.data);
    } else {
        $ctrl.vouchers = [];
    }

    $ctrl.cleanReload = () => {
        $state.go($state.current.name, {
            digid_success: null,
            digid_error: null,
        });
    };

    $ctrl.$onInit = () => {
        if ($stateParams.digid_error != null) {
            $state.go('error', {
                errorCode: 'digid_' + $stateParams.digid_error
            });
        }

        if (appConfigs.features.banner) {
            $ctrl.headerStyle = {
                'background-image': 'url("' + appConfigs.features.banner.sizes.large + '")',
            }
        }

        $ctrl.overlayStyles = { opacity: $ctrl.appConfigs.features.settings.overlay_opacity };

        if ($ctrl.appConfigs.features.settings.overlay_type != 'color') {
            $ctrl.overlayStyles['background-image'] = 'url("/assets/img/banner-patterns/' + $ctrl.appConfigs.features.settings.overlay_type + '.svg")';
        }

        $ctrl.description_html = $sce.trustAsHtml(appConfigs.features.settings.description_html);
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
        '$state',
        '$stateParams',
        '$sce',
        'appConfigs',
        'ModalService',
        'AuthService',
        'VoucherService',
        HomeComponent,
    ],
    templateUrl: 'assets/tpl/pages/home.html'
};
