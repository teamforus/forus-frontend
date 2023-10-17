const pick = require('lodash/pick');

const TopNavbarDirective = function (
    $state,
    $scope,
    $filter,
    appConfigs,
    $rootScope,
    MenuService,
    ModalService,
    ConfigService,
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

    $dir.toggleSearchBox = ($e) => {
        $e.stopPropagation();
        $e.preventDefault();

        $rootScope.showSearchBox = !$rootScope.showSearchBox;
    }

    $dir.hideMobileMenu = () => {
        $rootScope.mobileMenuOpened = false;
    }

    $dir.openMobileMenu = ($e) => {
        if ($e?.target?.tagName != 'A') {
            $e.stopPropagation();
            $e.preventDefault();
        }

        $rootScope.mobileMenuOpened = !$rootScope.mobileMenuOpened;
    }

    $dir.$onInit = () => {
        window.addEventListener('scroll', updateScrolled);

        // Organization logo alternative text
        $dir.logoExtension = ConfigService.getFlag('logoExtension');
        $dir.orgLogoAltText = $i18n(`logo_alt_text.${appConfigs.client_key}`, {}, appConfigs.client_key);

        if (appConfigs.flags.genericSearchUseToggle) {
            $rootScope.showSearchBox = false;
        } else {
            window.addEventListener('resize', onResize);
            onResize();
        }

        $rootScope.$watch(
            (scope) => pick(scope, ['auth_user', 'appConfigs']),
            (value) => $dir.menuItems = MenuService.makeMenuItems(value.appConfigs, value.auth_user),
            true
        );
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
            'MenuService',
            'ModalService',
            'ConfigService',
            TopNavbarDirective,
        ],
        templateUrl: 'assets/tpl/directives/top-navbar.html',
    };
};