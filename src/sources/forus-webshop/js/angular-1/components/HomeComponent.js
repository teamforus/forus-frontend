let HomeComponent = function(
    $scope,
    $stateParams,
    ModalService,
    AuthService,
    VoucherService,
) {

    let $ctrl = this;

    $ctrl.showPopupOffices = function() {
        ModalService.open('modalOffices', {});
    };

    if ($stateParams.confirmed) {
        ModalService.open('modalActivateCode', {});
    }

    $scope.openAuthCodePopup = function () {
        ModalService.open('modalAuthCode', {});
    };

    $scope.openActivateCodePopup = function () {
        ModalService.open('modalActivateCode', {});
    };

    $ctrl.openInMeModal = () => {
        return ModalService.open('modalOpenInMe', {});
    };

    $ctrl.$onInit = function() {
        if(AuthService.hasCredentials()) {
            VoucherService.list().then(res => {
                $ctrl.vouchers = res.data.data; 
            });
        } else {
            $ctrl.vouchers = [];
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
        '$stateParams',
        'ModalService',
        'AuthService',
        'VoucherService',
        HomeComponent,
    ],
    templateUrl: 'assets/tpl/pages/home.html'
};