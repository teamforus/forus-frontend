let TopNavbarDirective = function(
    $scope,
    $translate,
    ModalService,
    ConfigService
) {
    $scope.mobileMenu = false;
    $scope.$ctrl = {
        userMenuOpened: false
    };
    
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

    $scope.$ctrl.openUserMenu = (e) => {
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();
        
        $scope.$ctrl.userMenuOpened = !$scope.$ctrl.userMenuOpened;
    }

    $scope.$ctrl.hideUserMenu = () => {
        $scope.$apply(() => {
            $scope.$ctrl.userMenuOpened = false;
        });
    }
};

module.exports = () => {
    console.log("loading topnavbar ...")
    return {
        scope: {
            text: '=',
            button: '=',
        },
        restrict: "EA",
        replace: false,
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