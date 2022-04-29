const TopNavbarDirective = function(
    $scope,
    $state,
    FundService,
    ModalService,
    ConfigService
) {
    $scope.mobileMenu = false;
    $scope.$ctrl = {
        userMenuOpened: false,
        prevOffsetY: null,
        visible: true,
        hideOnScroll: !!$scope.hideOnScroll,
    };

    const $ctrl = this;
    
    FundService.list().then(res => $ctrl.funds = res.data.data);

    $scope.startFundRequest = () => $state.go('start');
    $scope.openAuthPopup = () => ModalService.open('modalAuth');

    $scope.openPinCodePopup = () => {
        $scope.$ctrl.userMenuOpened = false;
        ModalService.open('modalPinCode');
    };

    $scope.cfg = {
        logoExtension: ConfigService.getFlag('logoExtension'),
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
            query: '=',
            hideOnScroll: '=',
            searchResultPage: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            'FundService',
            'ModalService',
            'ConfigService',
            TopNavbarDirective
        ],
        templateUrl: 'assets/tpl/directives/top-navbar.html',
    };
};