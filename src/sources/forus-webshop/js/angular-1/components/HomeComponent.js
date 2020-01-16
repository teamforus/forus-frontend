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
                "Dit BSN-nummer is onbekend in het systeem. Start uw aanvraag om een account aan te maken.",
            );

            $ctrl.cleanReload();
        } else if ($stateParams.digid_error != null) {
            PushNotificationsService.danger(
                "Er is een fout opgetreden in de communicatie met DigiD. Probeert u het later nogmaals.",
                "Indien deze fout blijft aanhouden, kijk dan op de website https://www.digid.nl/ voor de laatste informatie",
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
