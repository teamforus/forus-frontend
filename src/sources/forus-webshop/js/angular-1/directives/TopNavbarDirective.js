let TopNavbarDirective = function(
    $scope,
    $translate,
    $state,
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
    
    FundService.list().then(res => {
        $ctrl.funds = res.data.data;
    })

    $scope.startFundRequest = () => {
        if ($ctrl.funds.length > 0) {
            $state.go('start');
        }
    };

    /* $scope.startFundRequest = () => {
        if ($ctrl.funds.length > 0) {
            $state.go('fund-request', {
                fund_id: $ctrl.funds[0].id
            });
        }
    }; */

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
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$translate',
            '$state',
            'ModalService',
            'ConfigService',
            'FundService',
            TopNavbarDirective
        ],
        templateUrl: 'assets/tpl/directives/top-navbar.html' 
    };
};