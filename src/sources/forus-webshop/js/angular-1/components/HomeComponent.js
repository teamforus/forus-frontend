let HomeComponent = function(
    $scope,
    $state,
    $stateParams,
    appConfigs,
    ModalService,
    AuthService,
    VoucherService,
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.appConfigs = appConfigs;

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
        if ($stateParams.digid_error == 'uid_not_found') {
            PushNotificationsService.danger(
                "Onbekend BSN-nummer.",
            );

            $ctrl.cleanReload();
        } else if ($stateParams.digid_error != null) {
            PushNotificationsService.danger(
                "Er ging iets mis.",
                "Er kon niet ingelogd worden met DigiD door een onbekend probleem.",
            );

            $ctrl.cleanReload();
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
        '$scope',
        '$state',
        '$stateParams',
        'appConfigs',
        'ModalService',
        'AuthService',
        'VoucherService',
        'PushNotificationsService',
        HomeComponent,
    ],
    templateUrl: 'assets/tpl/pages/home.html'
};
