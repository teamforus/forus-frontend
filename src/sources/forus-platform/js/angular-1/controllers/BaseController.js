let BaseController = function(
    $q,
    $rootScope,
    $scope,
    $state,
    $translate,
    AuthService,
    IdentityService,
    RecordService,
    OrganizationService,
    ConfigService,
    appConfigs,
    ModalService
) {
    let invalidOrganizationPermissions = {
        sponsor: [
            "manage_provider_funds", "manage_products", "manage_offices",
            "scan_vouchers"
        ],
        provider: [
            "manage_funds", "manage_providers", "manage_validators",
            "validate_records", "scan_vouchers"
        ],
        validator: []
    } [appConfigs.panel_type];

    let requiredOrganizationPermissions = {
        sponsor: [

        ],
        provider: [

        ],
        validator: [
            "scan_vouchers"
        ]
    };

    let loadOrganizations = () => {
        let deferred = $q.defer();

        OrganizationService.list({
            dependency: "permissions,logo"
        }).then(res => {
            $scope.organizations = res.data.data.filter(organization => {
                return organization.permissions.filter((permission => {
                    return invalidOrganizationPermissions.indexOf(permission) == -1;
                })).length > 0;
            });
    
            $scope.organizations.filter(organization => {
                return requiredOrganizationPermissions.validator.filter(permission => {
                    return organization.permissions.indexOf(permission) != -1;
                }).length == requiredOrganizationPermissions.validator.length;
            });

            deferred.resolve($scope.organizations);
        }, deferred.reject);

        return deferred.promise;
    };
    
    $scope.$ctrl = {
        userMenuOpened: false,
        showOrganizationsMenu: false
    };

    $scope.chooseOrganization = (organization) => {
        $scope.$ctrl.showOrganizationsMenu = false;
        OrganizationService.use(organization.id);

        localStorage.setItem('last_selected_organization_id', organization.id);

        $state.go($state.current.name, {
            organization_id: organization.id
        });
    };

    $scope.organizationEdit = (organization) => {
        $scope.$ctrl.showOrganizationsMenu = false;

        $state.go('organizations-edit', {
            id: organization.id
        });
    };

    $scope.organizationCreate = () => {
        $scope.$ctrl.showOrganizationsMenu = false;
        
        $state.go('organizations-create');
    };

    $scope.$ctrl.openOrganizationsMenu = (e) => {
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();
        
        $scope.$ctrl.showOrganizationsMenu = !$scope.$ctrl.showOrganizationsMenu;
    }

    $scope.$ctrl.hideOrganizationsMenu = () => {
        $scope.$apply(() => {
            $scope.$ctrl.showOrganizationsMenu = false;
        });
    }

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

    $rootScope.openPinCodePopup = function() {
        ModalService.open('modalPinCode', {});
    };

    $scope.getLastUsedOrganization = () => {
        let deferred = $q.defer();
        let lastOrganizationId = localStorage.getItem('last_selected_organization_id');

        loadOrganizations().then(organizations => {
            if (lastOrganizationId) {
                deferred.resolve(lastOrganizationId);
            } else {
                deferred.resolve(organizations.length ? $scope.organizations[0].id : null);
            }
        });

        return deferred.promise;
    };

    $rootScope.autoSelectOrganization = function($redirectAuthorizedState = null) {
        $scope.getLastUsedOrganization().then(lastOrganizationId => {
            if (lastOrganizationId) {
                OrganizationService.use(lastOrganizationId);
        
                $state.go($redirectAuthorizedState ? $redirectAuthorizedState : {
                    sponsor: 'organization-funds',
                    provider: 'offices',
                    validator: 'fund-requests',
                }[appConfigs.panel_type], {
                    organization_id: lastOrganizationId
                });
            } else {
                $state.go('organizations-create');
            }
        });
    };

    $rootScope.loadAuthUser = function() {
        let deferred = $q.defer();
        
        IdentityService.identity().then((res) => {
            let auth_user = res.data;

            RecordService.list().then((res) => {
                auth_user.records = res.data;
                /* auth_user.primary_email = res.data.filter((record) => {
                    return record.key == 'primary_email';
                })[0].value; */

                OrganizationService.list({
                    dependency: "permissions,logo"
                }).then((res) => {
                    auth_user.organizations = res.data.data;
                    auth_user.organizationsMap = {};
                    auth_user.organizationsIds = Object.values(res.data.data).map(function(organization) {
                        auth_user.organizationsMap[organization.id] = organization;
                        return organization.id;
                    });

                    deferred.resolve($rootScope.auth_user = auth_user);
                });
            });
        }, deferred.reject);

        return deferred.promise;
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
            $rootScope.activeOrganization = null;
            $state.go('organziations');
        }
    });

    $rootScope.$on('auth:update', () => {
        $rootScope.loadAuthUser();
    });

    loadOrganizations();
    loadActiveOrganization();

    $rootScope.activeOrganization = OrganizationService.active();

    $rootScope.signOut = () => {
        AuthService.signOut();
        $state.go('home');
        $rootScope.activeOrganization = null;
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
    '$q',
    '$rootScope',
    '$scope',
    '$state',
    '$translate',
    'AuthService',
    'IdentityService',
    'RecordService',
    'OrganizationService',
    'ConfigService',
    'appConfigs',
    'ModalService',
    BaseController
];