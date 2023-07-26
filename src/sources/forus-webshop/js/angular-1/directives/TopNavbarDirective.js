const TopNavbarDirective = function (
    $state,
    $scope,
    $filter,
    appConfigs,
    $rootScope,
    ModalService,
    ConfigService
) {
    const $dir = $scope.$dir;
    const $i18n = $filter('i18n');

    const updateScrolled = function () {
        const currentOffsetY = window.pageYOffset;

        $dir.visible = ($dir.prevOffsetY > currentOffsetY) || (currentOffsetY <= 0);
        $dir.prevOffsetY = currentOffsetY;
    };

    const onResize = () => {
        $rootScope.showSearchBox = window.innerWidth >= 1000;
    };

    $dir.visible = false;
    $dir.prevOffsetY = false;
    $dir.userMenuOpened = false;

    $dir.startFundRequest = (data = {}) => {
        $state.go('start', data, { reload: true, inherit: false });
    };

    $dir.goToState = (state_name) => {
        $state.go(state_name, {}, { reload: true, inherit: false });
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

    $dir.$onInit = () => {
        window.addEventListener('scroll', updateScrolled);
        window.addEventListener('resize', onResize);

        $dir.logoExtension = ConfigService.getFlag('logoExtension');

        // Organization logo alternative text
        $dir.orgLogoAltText = $i18n(`logo_alt_text.${appConfigs.client_key}`, {}, appConfigs.client_key);
        onResize();
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
            '$filter',
            'appConfigs',
            '$rootScope',
            'ModalService',
            'ConfigService',
            TopNavbarDirective,
        ],
        templateUrl: 'assets/tpl/directives/top-navbar.html',
    };
};