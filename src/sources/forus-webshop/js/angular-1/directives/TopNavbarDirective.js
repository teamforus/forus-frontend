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

    const menuItems = [{
        "id": "home_page",
        "nameKey": `topnavbar.items.home`,
        "sref": "home",
        "srefParams": {},
        "target": "_self",
        "enabled": true,
    }, {
        "id": "funds_page",
        "nameKey": `topnavbar.items.${appConfigs.client_key}.funds`,
        "nameDefault": $i18n(`topnavbar.items.funds`),
        "sref": "funds",
        "srefParams": {},
        "target": "_self",
        "enabled": appConfigs.flags.fundsMenu && 
            ($rootScope.auth_user || appConfigs.flags.fundsMenuIfLoggedOut),
    }, {
        "id": "products_page",
        "nameKey": `topnavbar.items.${appConfigs.client_key}.products`,
        "nameDefault": $i18n(`topnavbar.items.products`),
        "sref": "products",
        "srefParams": {},
        "target": "_self",
        "enabled": appConfigs.features.has_budget_funds && 
            appConfigs.features.products.list && 
            (appConfigs.flags.productsMenu || $rootScope.auth_user),
    }, {
        "id": "actions_page",
        "nameKey": `topnavbar.items.subsidies`,
        "sref": "actions",
        "srefParams": {},
        "target": "_self",
        "enabled": appConfigs.features.has_subsidy_funds && 
            appConfigs.features.products.list && 
            (appConfigs.flags.productsMenu || $rootScope.auth_user),
    }, {
        "id": "providers_page",
        "nameKey": `topnavbar.items.providers`,
        "sref": "providers",
        "srefParams": {},
        "target": "_self",
        "enabled": appConfigs.flags.providersMenu,
    }, {
        "id": "explanation_page",
        "target": appConfigs.features.pages.explanation && 
            appConfigs.features.pages.explanation.external ? '_blank' : '_self',
        "class": !appConfigs.flags.providersSignUpMenu ? 'navbar-item-wrapper_first-to-last' : '',
        "nameKey": `topnavbar.items.${appConfigs.client_key}.explanation`,
        "nameDefault": $i18n(`topnavbar.items.explanation`),
        "sref": "explanation",
        "srefParams": {},
        "target": "_self",
        "enabled": true,
    }, {
        "id": "providers_sign_up_page",
        "class": appConfigs.flags.providersSignUpMenu ? 'navbar-item-wrapper_first-to-last' : '',
        "nameKey": `topnavbar.items.signup`,
        "sref": "sign-up",
        "srefParams": {},
        "target": "_self",
        "enabled": appConfigs.flags.providersSignUpMenu,
    }];

    const makeMenuItems = () => {
        $dir.menuItems = menuItems.filter(menuItem => menuItem.enabled);

        if (appConfigs.flags.overrideMenuItems) {
            $dir.menuItems = appConfigs.flags.menuItems.map(menuItem => {
                let defaultItem = $dir.menuItems.find(item => item.id == menuItem.id);

                let item = {
                    ...defaultItem,
                    ...menuItem,
                };
                
                return {
                    ...item,
                    nameKey: !item.name ? item.nameKey : 'null',
                    nameDefault: !menuItem.name ? item.nameDefault : item.name,
                    target: item.target || "_self",
                    sref: `${menuItem.sref}(${JSON.stringify(menuItem.srefParams)})`,
                    enabled: true,
                };
            });
        }

        const requiredItems = [{
            "id": "social_media_items",
            "class": (appConfigs.features.social_medias.length ? '' : 'navbar-item-wrapper_first-to-last') + 
                " navbar-item-wrapper_social_icons",
            "enabled": true,
        }, {
            "id": "logout_item",
            "class": "navbar-item-wrapper_sign-out",
            "enabled": $rootScope.auth_user,
        }];

        requiredItems.forEach(item => {
            $dir.menuItems.push(item);
        });
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

        makeMenuItems();
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