let TopNavbarDirective = function(
    $scope,
    $translate,
    ModalService,
    ConfigService
) {
    $scope.mobileMenu = false;
    
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
        logoExtension: ConfigService.getFlag('logoExtension'),
    };
    
    $scope.i18nActive = $translate.use();
    $scope.i18nLangs = $translate.getAvailableLanguageKeys();

    $scope.setLang = (lang) => {
        $translate.use(lang);
        $scope.i18nActive = $translate.use();
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
            '$translate',
            'ModalService',
            'ConfigService',
            TopNavbarDirective
        ],
        templateUrl: 'assets/tpl/directives/top-navbar.html' 
    };
};