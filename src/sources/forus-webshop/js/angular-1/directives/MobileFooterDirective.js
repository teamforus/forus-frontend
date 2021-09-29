let MobileFooterDirective = function(
    $scope,
    $state,
    $location,
    $translate,
    ModalService,
    FundService
) {
    let $ctrl = this;
    let prevOffsetY = window.pageYOffset;

    $scope.visible = true;
    $scope.i18nLangs = $translate.getAvailableLanguageKeys();
    $scope.i18nActive = $translate.use();

    $scope.isActive = function(destination) {
        return destination === $location.path();
    } 
    
    $scope.startFundRequest = () => {
        if ($ctrl.funds.length > 0) {
            $state.go('start');
        }
    };

    $scope.openAuthPopup = function() {
        ModalService.open('modalAuth', {});
    };

    $scope.openPinCodePopup = function() {
        ModalService.open('modalPinCode', {});
    };

    $scope.openActivateCodePopup = function() {
        $state.go('start');
    };

    $scope.openAuthCodePopup = function() {
        ModalService.open('modalAuthCode', {});
    };

    $scope.showPopupOffices = function() {
        ModalService.open('modalOffices', {});
    };

    $scope.setLang = (lang) => {
        $translate.use(lang);
        $scope.i18nActive = $translate.use();
    };

    $scope.updateScrolled = function() {
        let currentOffsetY = window.pageYOffset;

        $scope.visible = (prevOffsetY > currentOffsetY) || (currentOffsetY <= 0);
        prevOffsetY = currentOffsetY;
    };
    
    FundService.list().then(res => $ctrl.funds = res.data.data);
    window.addEventListener('scroll', $scope.updateScrolled);

    $scope.$on('$destroy', function() {
        window.removeEventListener('scroll', $scope.updateScrolled);
    });
};

module.exports = () => {
    return {
        scope: {},
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            '$location',
            '$translate',
            'ModalService',
            'FundService',
            MobileFooterDirective
        ],
        templateUrl: 'assets/tpl/directives/mobile-footer.html'
    };
};
