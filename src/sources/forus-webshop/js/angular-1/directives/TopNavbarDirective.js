let TopNavbarDirective = function(
    $state,
    $scope,
    $translate,
    ModalService,
    ConfigService,
    FundService
) {
    $scope.mobileMenu = false;
    $scope.$ctrl = {
        userMenuOpened: false,
        prevOffsetY: null,
        visible: true,
        hideOnScroll: !!$scope.hideOnScroll,
    };

    let $ctrl = this;
    
    FundService.list().then(res => $ctrl.funds = res.data.data);

    $scope.startFundRequest = () => $state.go('start');
    $scope.openAuthPopup = () => ModalService.open('modalAuth');
    $scope.openAuthCodePopup = () => ModalService.open('modalAuthCode');
    $scope.openActivateCodePopup = () => $state.go('start');

    $scope.openPinCodePopup = () => {
        $scope.$ctrl.userMenuOpened = false;
        ModalService.open('modalPinCode');
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

    $scope.$ctrl.openUserMenu = ($e) => {
        if ($e?.target?.tagName != 'A') {
            $e.stopPropagation();
            $e.preventDefault();
        }
        
        $scope.$ctrl.userMenuOpened = !$scope.$ctrl.userMenuOpened;
    }

    $scope.$ctrl.hideUserMenu = () => {
        $scope.$apply(() => $scope.$ctrl.userMenuOpened = false);
    }

    $scope.updateScrolled = function() {
        let currentOffsetY = window.pageYOffset;

        $scope.$ctrl.visible = ($scope.$ctrl.prevOffsetY > currentOffsetY) || (currentOffsetY <= 0);
        $scope.$ctrl.prevOffsetY = currentOffsetY;
    };

    window.addEventListener('scroll', $scope.updateScrolled);

    $scope.$on('$destroy', function() {
        window.removeEventListener('scroll', $scope.updateScrolled);
    });
};

module.exports = () => {
    return {
        scope: {
            hideOnScroll: '=',
            searchResultPage: '=',
            query: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$state',
            '$scope',
            '$translate',
            'ModalService',
            'ConfigService',
            'FundService',
            TopNavbarDirective
        ],
        templateUrl: 'assets/tpl/directives/top-navbar.html' 
    };
};