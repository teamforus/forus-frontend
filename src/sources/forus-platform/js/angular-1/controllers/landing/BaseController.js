let BaseController = function(
    $rootScope,
    $scope,
    $state,
    appConfigs,
    ConfigService,
    CredentialsService, 
    IdentityService,
    ModalService
) {
    $rootScope.appConfigs = appConfigs;
    $scope.appConfigs = appConfigs;

    ConfigService.get('dashboard').then((res) => {
        $rootScope.appConfigs.features = res.data;
        $rootScope.appConfigs.frontends = res.data.fronts;
    });
    
    $scope.openAuthPopup = function () {
        ModalService.open('modalAuth', {});
    };

    console.log('test');
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
    'ModalService',
    BaseController
];