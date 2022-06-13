let HomeComponent = function (
    $state,
    $stateParams,
    $interval,
    $sce,
    appConfigs,
    ModalService,
    AuthService,
    VoucherService
) {
    let $ctrl = this;
    let val = 0;

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
    $ctrl.openAuthCodePopup = () => ModalService.open('modalAuthCode');
    $ctrl.openActivateCodePopup = () => $state.go('start');

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

        let blocks = appConfigs.features.pages.home.blocks;

        blocks.forEach(block => {
            block.description_html_trusted = $sce.trustAsHtml(block.description_html || '');
        });

        $ctrl.fund_blocks = blocks.filter(block => {
            return block.key == 'funds_block';
        });

        $ctrl.description_below_header = blocks.find(block => {
            return block.key == 'below_header';
        }).description_html_trusted;
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
        '$interval',
        '$sce',
        'appConfigs',
        'ModalService',
        'AuthService',
        'VoucherService',
        HomeComponent,
    ],
    templateUrl: 'assets/tpl/pages/home.html'
};
