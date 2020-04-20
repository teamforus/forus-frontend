let HomeComponent = function(
    $state,
    $stateParams,
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
        ModalService.open('modalActivateCode', {});
    }

    $ctrl.startFundRequest = () => {
        if ($ctrl.funds.length > 0) {
            $state.go('fund-request', {
                fund_id: $ctrl.funds[0].id
            });
        }
    };

    $ctrl.openInMeModal = () => ModalService.open('modalOpenInMe');
    $ctrl.showPopupOffices = () => ModalService.open('modalOffices');
    $ctrl.openAuthCodePopup = () => ModalService.open('modalAuthCode');
    $ctrl.openActivateCodePopup = () => ModalService.open('modalActivateCode');

    if (AuthService.hasCredentials()) {
        VoucherService.list().then(res => {
            $ctrl.vouchers = res.data.data;
        });
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
    };
};

module.exports = {
    bindings: {
        funds: '<',
    },
    scope: {
        text: '=',
        button: '=',
    },
    controller: [
        '$state',
        '$stateParams',
        'appConfigs',
        'ModalService',
        'AuthService',
        'VoucherService',
        HomeComponent,
    ],
    templateUrl: 'assets/tpl/pages/home.html'
};
