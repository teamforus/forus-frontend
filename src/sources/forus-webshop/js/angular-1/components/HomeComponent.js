let HomeComponent = function(
    $scope,
    $state,
    $stateParams,
    ModalService,
    AuthService,
    VoucherService,
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.showPopupOffices = function() {
        ModalService.open('modalOffices', {});
    };

    if ($stateParams.confirmed) {
        ModalService.open('modalActivateCode', {});
    }

    $scope.openAuthCodePopup = function() {
        ModalService.open('modalAuthCode', {});
    };

    $scope.openActivateCodePopup = function() {
        ModalService.open('modalActivateCode', {});
    };

    $ctrl.openInMeModal = () => {
        return ModalService.open('modalOpenInMe', {});
    };

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
        'ModalService',
        'AuthService',
        'VoucherService',
        'PushNotificationsService',
        HomeComponent,
    ],
    templateUrl: 'assets/tpl/pages/home.html'
};
