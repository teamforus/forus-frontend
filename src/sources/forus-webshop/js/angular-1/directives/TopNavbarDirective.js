let TopNavbarDirective = function(
    $scope,
    ModalService,
    ConfigService
) {
    $scope.openAuthPopup = function () {
        ModalService.open('modalAuth', {});
    };

    $scope.openPinCodePopup = function () {
        ModalService.open('modalPinCode', {});
    };

    $scope.openActivateCodePopup = function () {
        ModalService.open('modalActivateCode', {});
    };

    $scope.openAuthCodePopup = function () {
        ModalService.open('modalAuthCode', {});
    };

    $scope.cfg = {
        logoExtension: ConfigService.getFlag('logoExtension')
    };
};

module.exports = () => {
    return {
        scope: {
            text: '=',
            button: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'ModalService',
            'ConfigService',
            TopNavbarDirective
        ],
        templateUrl: 'assets/tpl/directives/top-navbar.html' 
    };
};