const TopNavbarDirective = function (
    $state,
    $scope,
    $rootScope,
    ModalService,
    ConfigService
) {
    const $dir = $scope.$dir;

    $dir.visible = false;
    $dir.prevOffsetY = false;
    $dir.userMenuOpened = false;

    $dir.startFundRequest = (data = {}) => {
        $state.go('start', data, { reload: true, inherit: false });
    };

    $dir.openPinCodePopup = () => {
        $dir.userMenuOpened = false;
        ModalService.open('modalPinCode');
    };

    $dir.openUserMenu = ($e) => {
        if ($e?.target?.tagName != 'A') {
            $e.stopPropagation();
            $e.preventDefault();
        }

        $dir.userMenuOpened = !$dir.userMenuOpened;
    }

    $dir.hideUserMenu = () => {
        $dir.userMenuOpened = false;
    }

    const updateScrolled = function () {
        const currentOffsetY = window.pageYOffset;

        $dir.visible = ($dir.prevOffsetY > currentOffsetY) || (currentOffsetY <= 0);
        $dir.prevOffsetY = currentOffsetY;
    };

    const isMobileDevice = () => window.innerWidth >= 1000;

    const onResize = () => {
        $rootScope.showSearchBox = isMobileDevice();
    };

    $dir.$onInit = () => {
        window.addEventListener('scroll', updateScrolled);
        window.addEventListener('resize', onResize);
           
        $dir.logoExtension = ConfigService.getFlag('logoExtension');
        $rootScope.showSearchBox = isMobileDevice();
    };

    $dir.$onDestroy = () => {
        window.removeEventListener('scroll', updateScrolled);
        window.removeEventListener('resize', onResize);
    };
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
        controllerAs: '$dir',
        controller: [
            '$state',
            '$scope',
            '$rootScope',
            'ModalService',
            'ConfigService',
            TopNavbarDirective,
        ],
        templateUrl: 'assets/tpl/directives/top-navbar.html',
    };
};