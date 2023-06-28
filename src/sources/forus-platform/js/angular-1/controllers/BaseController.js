const BaseController = function (
    $q,
    $rootScope,
    $scope,
    $state,
    $filter,
    $translate,
    AuthService,
    IdentityService,
    RecordService,
    OrganizationService,
    ConfigService,
    PermissionsService,
    appConfigs,
    ModalService,
    AnnouncementService,
) {
    const selected_organization_key = 'selected_organization_id';

    const loadOrganizations = () => {
        return $q((resolve, reject) => {
            OrganizationService.list({
                per_page: 500,
                order_by: `is_${appConfigs.panel_type}`,
                order_by_dir: 'desc',
                dependency: "permissions,logo",
            }).then((res) => resolve($scope.organizations = res.data.data), reject);
        });
    };

    const loadActiveOrganization = () => {
        const organizationId = OrganizationService.active();

        if (!organizationId) {
            return OrganizationService.clearActive();
        }

        OrganizationService.read(organizationId).then((res) => {
            $rootScope.activeOrganization = res.data.data;

            AnnouncementService.list($rootScope.activeOrganization.id).then((res) => {
                $rootScope.organizationAnnouncements = res.data.data;
            });
        }, () => OrganizationService.clearActive());
    };

    $rootScope.popups = {
        auth: {
            show: false,
            screen: false,
            close: function () {
                this.show = false;
                this.screen = false;
            },
            open: function (screen) {
                this.show = true;
                this.screen = screen;
            }
        }
    };

    $rootScope.$state = $state;
    $rootScope.appConfigs = appConfigs;
    $rootScope.placeholders = appConfigs.placeholders;

    $rootScope.changeOrganization = (value) => {
        if (OrganizationService.active()) {
            OrganizationService.use($rootScope.activeOrganization.id);

            localStorage.setItem(selected_organization_key, $rootScope.activeOrganization.id);

            $state.go($state.current.name, {
                organization_id: $rootScope.activeOrganization.id
            });
        }
    };

    $rootScope.openPinCodePopup = function () {
        ModalService.open('modalPinCode', {});
    };

    $rootScope.redirectToDashboard = (selectedOrganizationId) => {
        if (!$rootScope.auth_user) {
            return;
        }

        const route = PermissionsService.getAvailableRoutes(
            appConfigs.panel_type,
            $rootScope.auth_user.organizationsMap[selectedOrganizationId]
        ).map((route) => route.name)[0] || null;

        if (!route) {
            return $state.go('no-permission');
        }

        $state.go(route, { organization_id: selectedOrganizationId });
    };

    $rootScope.getLastUsedOrganization = (organizations) => {
        const selectedOrganizationId = localStorage.getItem(selected_organization_key);
        const organization = organizations.find((item) => item.id == selectedOrganizationId);

        return organization ? organization.id : organizations[0]?.id;
    };

    $rootScope.autoSelectOrganization = function (auth_user, redirect = true) {
        const selectedOrganizationId = $rootScope.getLastUsedOrganization(auth_user.organizations);

        if (selectedOrganizationId) {
            OrganizationService.use(selectedOrganizationId);

            if (redirect) {
                $rootScope.redirectToDashboard(selectedOrganizationId);
            }
        } else {
            $state.go('organizations-create');
        }
    };

    $rootScope.loadAuthUser = function () {
        const deferred = $q.defer();

        IdentityService.identity().then((res) => {
            const auth_user = res.data;

            RecordService.list().then(() => {
                loadOrganizations().then((organizations) => {
                    auth_user.records = res.data;
                    auth_user.organizations = organizations;
                    auth_user.organizationsMap = {};
                    auth_user.organizationsIds = Object.values(organizations).map(function (organization) {
                        auth_user.organizationsMap[organization.id] = organization;
                        return organization.id;
                    });
    
                    auth_user.dashboards = auth_user.organizations.reduce((arr, item) => [...arr, ...[
                        item.is_sponsor ? 'sponsor' : null,
                        item.is_provider ? 'provider' : null,
                        item.is_validator ? 'validator' : null,
                    ]], []).filter((dashboard) => dashboard).filter((v, i, a) => a.indexOf(v) === i);
    
                    deferred.resolve($rootScope.auth_user = auth_user);
                })
            });
        }, deferred.reject);

        return deferred.promise;
    };

    $rootScope.$on('organization-changed', (e, id) => {
        if (!isNaN(parseInt(id))) {
            if ($rootScope.activeOrganization?.id !== id) {
                loadActiveOrganization();
            }
        } else {
            $rootScope.activeOrganization = null;
            $state.go('organziations');
        }
    });

    $rootScope.$on('auth:update', () => {
        $rootScope.loadAuthUser();
    });

    $rootScope.signOut = (deleteToken = true) => {
        AuthService.signOut(deleteToken);
        $state.go('home');
        $rootScope.activeOrganization = null;
        $rootScope.auth_user = false;
    };

    $rootScope.openUserMenu = (e) => {
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();

        $rootScope.userMenuOpened = !$rootScope.userMenuOpened;
    }

    $rootScope.hideUserMenu = () => {
        $scope.$apply(() => {
            $rootScope.userMenuOpened = false;
        });
    }

    $scope.$watch(() => $state.$current.name, (newVal, oldVal) => {
        if ($state.current.name == 'home') {
            $rootScope.viewLayout = 'landing';
        } else if ([
            'sign-up', 'sign-up-provider', 'sign-up-sponsor', 'sign-up-validator', 'provider-invitation-link'
        ].indexOf($state.current.name) != -1) {
            $rootScope.viewLayout = 'signup';

            if (['sign-up-provider', 'sign-up-sponsor', 'sign-up-validator'].indexOf($state.current.name) != -1) {
                $rootScope.isNewSignUp = true;
            }
        } else {
            $rootScope.viewLayout = 'panel';
        }
    })

    $rootScope.onPageChanged = (transition) => {
        let pageTitleKey = 'page_state_titles.' + transition.to().name;
        let pageTitleText = $filter('translate')(pageTitleKey);
        let pageTitleDefault = $filter('translate')('page_title');

        $rootScope.layout = [];
        $rootScope.pageTitle = pageTitleText != pageTitleKey ? pageTitleText : pageTitleDefault;
        $rootScope.showAppHeader = true;

        document.body.scrollTop = document.documentElement.scrollTop = 0;
    };

    $translate.use('nl');

    if (AuthService.hasCredentials()) {
        $rootScope.loadAuthUser().then((auth_user) => {
            $rootScope.autoSelectOrganization(auth_user, $state.current.name == 'home');
        });
    } else {
        $rootScope.auth_user = false;
    }

    ConfigService.get('dashboard').then((res) => {
        const { fronts, announcements } = res.data;

        $rootScope.appConfigs.features = res.data;
        $rootScope.appConfigs.frontends = fronts;
        $rootScope.systemAnnouncements = announcements;
    });

    $translate.use(localStorage.getItem('lang') || 'nl');
};

module.exports = [
    '$q',
    '$rootScope',
    '$scope',
    '$state',
    '$filter',
    '$translate',
    'AuthService',
    'IdentityService',
    'RecordService',
    'OrganizationService',
    'ConfigService',
    'PermissionsService',
    'appConfigs',
    'ModalService',
    'AnnouncementService',
    BaseController,
];
