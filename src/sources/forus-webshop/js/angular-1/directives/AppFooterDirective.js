let AppFooterDirective = function(
    $sce,
    $scope,
    appConfigs
) { 
    $scope.appConfigs = appConfigs;
    $scope.$watch('appConfigs', (_appConfigs) => {
        if (_appConfigs.features && _appConfigs.features.settings) {
            $scope.settings = $scope.appConfigs.features.settings;
            $scope.description_contact_details_html = $sce.trustAsHtml($scope.appConfigs.features.settings.description_contact_details_html);
            $scope.description_opening_times_html = $sce.trustAsHtml($scope.appConfigs.features.settings.description_opening_times_html);
        }
    }, true);
};


module.exports = () => {
    return {
        scope: {
            settings: '=?'
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$sce',
            '$scope',
            'appConfigs',
            AppFooterDirective
        ],
        templateUrl: 'assets/tpl/directives/app-footer.html' 
    };
};