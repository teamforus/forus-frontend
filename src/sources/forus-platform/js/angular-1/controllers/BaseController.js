let BaseController = function(
    $rootScope,
    $scope,
    $state,
    $translate,
    AuthService,
    RecordService,
    OrganizationService,
    ConfigService,
    appConfigs,
    ModalService
) {
    $rootScope.$state = $state;

    $rootScope.popups = {
        auth: {
            show: false,
            screen: false,
            close: function() {
                this.show = false;
                this.screen = false;
            },
            open: function(screen) {
                this.show = true;
                this.screen = screen;
            }
        }
    };
    
    $scope.$ctrl = {
        userMenuOpened: false
    };

    $rootScope.openPinCodePopup = function() {
        ModalService.open('modalPinCode', {});
    };

    $rootScope.loadAuthUser = function() {
        AuthService.identity().then((res) => {
            let auth_user = res.data;

            RecordService.list().then((res) => {
                auth_user.records = res.data;
                auth_user.primary_email = res.data.filter((record) => {
                    return record.key == 'primary_email';
                })[0].value;
            });

            OrganizationService.list({
                dependency: "permissions,logo"
            }).then((res) => {
                auth_user.organizations = res.data.data;
                auth_user.organizationsMap = {};
                auth_user.organizationsIds = Object.values(res.data.data).map(function(organization) {
                    auth_user.organizationsMap[organization.id] = organization;
                    return organization.id;
                });
            });

            $rootScope.auth_user = auth_user;
        });
    };

    let loadActiveOrganization = () => {
        let organizationId = OrganizationService.active();

        if (organizationId === false) {
            OrganizationService.clearActive();
        } else {
            OrganizationService.read(organizationId).then((res) => {
                $rootScope.activeOrganization = res.data.data;
            }, () => {
                OrganizationService.clearActive();
            });
        }
    };

    $rootScope.$on('organization-changed', (e, id) => {
        if (!isNaN(parseInt(id))) {
            loadActiveOrganization();
        } else {
            $rootScope.activeOrganization = {};
            $state.go('organziations');
        }
    });

    $rootScope.$on('auth:update', () => {
        $rootScope.loadAuthUser();
    });

    loadActiveOrganization();

    $rootScope.activeOrganization = OrganizationService.active();

    $rootScope.signOut = () => {
        AuthService.signOut();
        $state.go('home');
        $rootScope.auth_user = false;
    };

    $rootScope.appConfigs = appConfigs;
    $scope.appConfigs = appConfigs;

    if (AuthService.hasCredentials()) {
        $rootScope.loadAuthUser();
    }

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

    $scope.$watch(function() {
        return $state.$current.name
    }, function(newVal, oldVal) {
        if ($state.current.name == 'home' && appConfigs.panel_type != 'validator') {
            $rootScope.viewLayout = 'landing';
        } else if ($state.current.name == 'sign-up' || $state.current.name == 'provider-invitation-link') {
            $rootScope.viewLayout = 'signup';
        } else {
            $rootScope.viewLayout = 'panel';
        }
    })

    ConfigService.get('dashboard').then((res) => {
        $rootScope.appConfigs.features = res.data;
        $rootScope.appConfigs.frontends = res.data.fronts;
    });

    $translate.use('nl');
};

module.exports = [
    '$rootScope',
    '$scope',
    '$state',
    '$translate',
    'AuthService',
    'RecordService',
    'OrganizationService',
    'ConfigService',
    'appConfigs',
    'ModalService',
    BaseController
];