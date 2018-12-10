let BaseController = function(
    $rootScope,
    $scope,
    appConfigs,
    ConfigService
) {
    $rootScope.appConfigs = appConfigs;
    $scope.appConfigs = appConfigs;

    ConfigService.get('dashboard').then((res) => {
        $rootScope.appConfigs.features = res.data;
        $rootScope.appConfigs.frontends = res.data.fronts;
    });

    $rootScope.appConfigs = appConfigs;
};

module.exports = [
    '$rootScope',
    '$scope',
    'appConfigs',
    'ConfigService',
    BaseController
];