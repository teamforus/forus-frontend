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

    const replaceMenuItems = (defaultMenuItems, customMenuItems) => {
        return customMenuItems.map((menuItem) => {
            const defaultItem = defaultMenuItems.find((item) => item.id == menuItem.id);
            const item = { ...defaultItem, ...{ ...menuItem, enabled: true } };

            return { ...item };
        }).filter((menuItem) => menuItem.enabled);
    };

    const makeMenuItems = (appConfigs, authUser) => {
        const features = appConfigs?.features;
        const flags = appConfigs?.flags;

        const defaultMenuItems = [{
            id: "home_page",
            nameTranslate: `topnavbar.items.home`,
            sref: "home",
            srefParams: {},
            target: "_self",
            enabled: true,
        }, {
            id: "funds_page",
            nameTranslate: `topnavbar.items.${appConfigs.client_key}.funds`,
            nameTranslateDefault: $i18n(`topnavbar.items.funds`),
            sref: "funds",
            srefParams: {},
            target: "_self",
            enabled: flags.fundsMenu && (!!authUser || flags.fundsMenuIfLoggedOut),
        }, {
            id: "products_page",
            nameTranslate: `topnavbar.items.${appConfigs.client_key}.products`,
            nameTranslateDefault: $i18n(`topnavbar.items.products`),
            sref: "products",
            srefParams: {},
            target: "_self",
            enabled: features?.has_budget_funds && features?.products?.list && (flags.productsMenu || !!authUser),
        }, {
            id: "actions_page",
            nameTranslate: `topnavbar.items.subsidies`,
            sref: "actions",
            srefParams: {},
            target: "_self",
            enabled: features?.has_subsidy_funds && features?.products?.list && (flags.productsMenu || !!authUser),
        }, {
            id: "providers_page",
            nameTranslate: `topnavbar.items.providers`,
            sref: "providers",
            srefParams: {},
            target: "_self",
            enabled: flags.providersMenu,
        }, {
            id: "explanation_page",
            target: features?.pages?.explanation?.external ? '_blank' : '_self',
            nameTranslate: `topnavbar.items.${appConfigs.client_key}.explanation`,
            nameTranslateDefault: $i18n(`topnavbar.items.explanation`),
            sref: "explanation",
            srefParams: {},
            target: "_self",
            enabled: true,
        }, {
            id: "providers_sign_up_page",
            nameTranslate: `topnavbar.items.signup`,
            sref: "sign-up",
            srefParams: {},
            target: "_self",
            enabled: flags.providersSignUpMenu,
        }].filter((menuItem) => menuItem.enabled);

        const requiredItems = [{
            id: "social_media_items",
            class: "navbar-item-wrapper_social_icons",
            enabled: true,
        }, {
            id: "logout_item",
            class: "navbar-item-wrapper_sign-out",
            enabled: !!authUser,
        }];

        $dir.menuItems = [
            ...(flags.menuItems ? replaceMenuItems(defaultMenuItems, flags.menuItems) : defaultMenuItems),
            ...requiredItems
        ].map((item) => ({
            ...item,
            nameTranslate: item?.name || item?.nameTranslate,
            nameTranslateDefault: item?.name || item?.nameTranslateDefault,
            target: item.target || "_self",
            srefValue: item.sref ? `${item.sref}(${item.srefParams ? JSON.stringify(item.srefParams) : ''})` : null,
        }));
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

        $rootScope.$watch('auth_user', () => makeMenuItems($rootScope.appConfigs, $rootScope.auth_user), true);
        $rootScope.$watch('appConfigs', () => makeMenuItems($rootScope.appConfigs, $rootScope.auth_user), true);
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