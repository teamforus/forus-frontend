let BaseController = function(
    $rootScope,
    $scope,
    $state,
    appConfigs,
    ConfigService
) {
    $rootScope.appConfigs = appConfigs;
    $scope.appConfigs = appConfigs;

    ConfigService.get('dashboard').then((res) => {
        $rootScope.appConfigs.features = res.data;
        $rootScope.appConfigs.frontends = res.data.fronts;
    });

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
    BaseController
];