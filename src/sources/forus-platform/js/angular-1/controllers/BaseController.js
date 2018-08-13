let BaseController = function(
    $rootScope,
    $scope,
    $state,
    IdentityService,
    AuthService,
    CredentialsService,
    RecordService,
    OrganizationService,
    appConfigs
) {
    $rootScope.loadAuthUser = function() {
        AuthService.identity().then((res) => {
            $rootScope.auth_user = res.data;

            RecordService.list().then((res) => {
                $rootScope.auth_user = {
                    records: res.data,
                    primary_email: res.data.filter((record) => {
                        return record.key == 'primary_email';
                    })[0].value
                };
            });

            OrganizationService.list().then((res) => {
                $rootScope.auth_user.organizations = res.data;
                $rootScope.auth_user.organizationsIds = Object.values(res.data.data).map(function(organization) {
                    return organization.id;
                });
            });
        });
    };

    $rootScope.$on('organization-changed', (event) => {
        $rootScope.activeOrganization = OrganizationService.active();
    });

    $rootScope.activeOrganization = OrganizationService.active();  

    $rootScope.signOut = () => {
        AuthService.signOut();
        $state.go('home');
        $rootScope.auth_user = false;
    };

    $rootScope.appConfigs = appConfigs;

    if (AuthService.hasCredentials()) {
        $rootScope.loadAuthUser();
    }
};

module.exports = [
    '$rootScope',
    '$scope',
    '$state',
    'IdentityService',
    'AuthService',
    'CredentialsService',
    'RecordService',
    'OrganizationService',
    'appConfigs',
    BaseController
];