let BaseController = function(
    $rootScope,
    $scope,
    $state,
    appConfigs,
    ConfigService,
    CredentialsService, 
    IdentityService,
    AuthService,
    RecordService,
    ModalService
) {
    $rootScope.appConfigs = appConfigs;
    $scope.appConfigs = appConfigs;

    ConfigService.get('dashboard').then((res) => {
        $rootScope.appConfigs.features = res.data;
        $rootScope.appConfigs.frontends = res.data.fronts;
    });
    
    $scope.openAuthPopup = function () {
        ModalService.open('modalAuth2', {});
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

            /*OrganizationService.list().then((res) => {
                auth_user.organizations = res.data.data;
                auth_user.organizationsMap = {};
                auth_user.organizationsIds = Object.values(res.data.data).map(function(organization) {
                    auth_user.organizationsMap[organization.id] = organization;
                    return organization.id;
                });
            });*/

            $rootScope.auth_user = auth_user;
        });
    };

    if (AuthService.hasCredentials()) {
        $rootScope.loadAuthUser();
    }
    
    $scope.$watch(function() {
        return $state.$current.name
    }, function(newVal, oldVal) {
        if ($state.current.name == 'sign-up') {
            $rootScope.viewLayout = 'signup';
        } else {
            $rootScope.viewLayout = 'landing';
        }
    });

    $rootScope.appConfigs = appConfigs;
};

module.exports = [
    '$rootScope',
    '$scope',
    '$state',
    'appConfigs',
    'ConfigService',
    'CredentialsService', 
    'IdentityService',
    'AuthService',
    'RecordService',
    'ModalService',
    BaseController
];