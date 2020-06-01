let MobileFooterDirective  = function(
    $scope,
    $translate,
    ModalService,
    ConfigService
) {
    $scope.scrolled = false;
    var prevScrollpos = window.pageYOffset;
    
    window.onscroll = function() {
        var currentScrollPos = window.pageYOffset;
        if (prevScrollpos > currentScrollPos) {
            $scope.scrolled = false;
        } else {
           $scope.scrolled = true;
    }

    prevScrollpos = currentScrollPos;
    }

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
    
    $scope.showPopupOffices = function() {
        ModalService.open('modalOffices', {});
    };

    $scope.showPopupOffices = function() {
        ModalService.open('modalOffices', {});
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
            MobileFooterDirective
        ],
        templateUrl: 'assets/tpl/directives/mobile-footer.html' 
    };
};