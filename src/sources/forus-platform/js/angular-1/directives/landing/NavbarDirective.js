let LandingNavbarDirective = function(
    $scope,
    ModalService,
    ConfigService
) {
    $scope.mobileMenu = false;
    
    $scope.openPinCodePopup = function () {
        ModalService.open('modalPinCode', {});
    };

    $scope.openAuthPopup = function () {
        ModalService.open('modalAuth', {});
    };

    $scope.cfg = {
        logoExtension: ConfigService.getFlag('logoExtension'),
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
            LandingNavbarDirective
        ],
        templateUrl: ($el, $attr) => {
            let template = $attr.template || 'navbar';
            return 'assets/tpl/directives/landing/' + template + '.html';
        }
    };
};