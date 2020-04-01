let BaseController = function(
    $rootScope,
    $scope,
    $state,
    $translate,
    appConfigs,
    ConfigService,
    IdentityService,
    AuthService,
    RecordService,
    OrganizationService,
    ModalService
) {
    $rootScope.appConfigs = appConfigs;
    $scope.appConfigs = appConfigs;
    let $ctrl = this;

    let invalidPermissions = {
        sponsor: [
            "manage_provider_funds", "manage_products", "manage_offices",
            "scan_vouchers"
        ],
        validator: [
            "manage_provider_funds", "manage_products", "manage_offices",
            "scan_vouchers"
        ],
        provider: [
            "manage_funds", "manage_providers", "manage_validators",
            "validate_records", "scan_vouchers"
        ]
    } [appConfigs.panel_type];

    ConfigService.get('dashboard').then((res) => {
        $rootScope.appConfigs.features = res.data;
        $rootScope.appConfigs.frontends = res.data.fronts;
    });
    
    $scope.openAuthPopup = function () {
        ModalService.open('modalAuth2', {});
    };

    $scope.openPinCodePopup = function () {
        ModalService.open('modalPinCode', {});
    };

    $rootScope.loadAuthUser = function() {
        IdentityService.identity().then((res) => {
            let auth_user = res.data;

            RecordService.list().then((res) => {
                auth_user.records = res.data;
                auth_user.primary_email = res.data.filter((record) => {
                    return record.key == 'primary_email';
                })[0].value;
            });

            OrganizationService.list().then((res) => {
                $ctrl.organizations = res.data.data.filter(organization => {
                    return organization.permissions.filter((permission => {
                        return invalidPermissions.indexOf(permission) == -1;
                    })).length > 0;
                });
                if ($ctrl.organizations.length == 1) {
                    OrganizationService.use($ctrl.organizations[0].id);
                }
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

    if (AuthService.hasCredentials()) {
        $rootScope.loadAuthUser();
    }

    loadActiveOrganization();

    $rootScope.activeOrganization = OrganizationService.active();

    $rootScope.signOut = () => {
        AuthService.signOut();
        $rootScope.auth_user = false;
        $rootScope.activeOrganization = null;
    };

    $scope.$watch(function() {
        return $state.$current.name
    }, function(newVal, oldVal) {
        if ($state.current.name == 'sign-up') {
            $rootScope.viewLayout = 'signup';
        } else {
            $rootScope.viewLayout = 'landing';
        }
    });
    $translate.use('nl');
    $rootScope.appConfigs = appConfigs;
};

module.exports = [
    '$rootScope',
    '$scope',
    '$state',
    '$translate',
    'appConfigs',
    'ConfigService',
    'IdentityService',
    'AuthService',
    'RecordService',
    'OrganizationService',
    'ModalService',
    BaseController
];