let MobileFooterDirective = function(
    $scope,
    $rootScope,
    $state,
    $translate,
    ModalService,
    FundService,
    VoucherService,
) {
    let $ctrl = this;
    let prevOffsetY = window.pageYOffset;

    $scope.visible = true;
    $scope.i18nLangs = $translate.getAvailableLanguageKeys();
    $scope.i18nActive = $translate.use();
    
    $scope.$ctrl = {
        profileMenuOpened: false,
    };

    $scope.isActive = function(stateName) {
        return $state.current.name == stateName;
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

    $scope.$ctrl.openProfileMenu = ($e) => {
        if ($e?.target?.tagName != 'A') {
            $e.stopPropagation();
            $e.preventDefault();
        }
        
        $scope.$ctrl.profileMenuOpened = !$scope.$ctrl.profileMenuOpened;
    }

    $scope.$ctrl.hideProfileMenu = () => {
        $scope.$apply(() => $scope.$ctrl.profileMenuOpened = false);
    }

    $scope.updateScrolled = function() {
        let currentOffsetY = window.pageYOffset;

        $scope.visible = (prevOffsetY > currentOffsetY) || (currentOffsetY <= 0);
        prevOffsetY = currentOffsetY;

        $scope.$ctrl.profileMenuOpened = false;
    };
    
    FundService.list().then(res => $ctrl.funds = res.data.data);

    $scope.vouchers = [];
    $scope.$watch(function() {
        return $rootScope.auth_user
    }, function(auth_user) {
        if (auth_user) {
            VoucherService.list().then(res => $scope.vouchers = res.data.data);
        }
    });

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
            '$rootScope',
            '$state',
            '$translate',
            'ModalService',
            'FundService',
            'VoucherService',
            MobileFooterDirective
        ],
        templateUrl: 'assets/tpl/directives/mobile-footer.html'
    };
};
