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

    if(AuthService.hasCredentials()) {
        VoucherService.list().then(res => {
            $ctrl.vouchers = res.data.data; });
        } else {
            $ctrl.vouchers = [];
        }



};

module.exports = {
    bindings: {
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
        'IdentityService',
        HomeComponent,
    ],
    templateUrl: 'assets/tpl/pages/home.html'
};