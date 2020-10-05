let MobileFooterDirective = function(
    $scope,
    $state,
    $translate,
    ModalService,
    FundService
) {
    let $ctrl = this;
    let prevOffsetY = window.pageYOffset;
    FundService.list().then(res => {
        $ctrl.funds = res.data.data;
    })
    $scope.startFundRequest = () => {
        if ($ctrl.funds.length > 0) {
            $state.go('fund-request', {
                fund_id: $ctrl.funds[0].id
            });
        }
    };

    $scope.visible = true;
    $scope.i18nLangs = $translate.getAvailableLanguageKeys();
    $scope.i18nActive = $translate.use();

    $scope.openAuthPopup = function() {
        ModalService.open('modalAuth', {});
    };

    $scope.openPinCodePopup = function() {
        ModalService.open('modalPinCode', {});
    };

    $scope.openActivateCodePopup = function() {
        ModalService.open('modalActivateCode', {});
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
            '$translate',
            'ModalService',
            'FundService',
            MobileFooterDirective
        ],
        templateUrl: 'assets/tpl/directives/mobile-footer.html'
    };
};