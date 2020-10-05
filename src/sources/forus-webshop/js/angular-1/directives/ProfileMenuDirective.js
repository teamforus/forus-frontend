let ProfileMenuDirective = function(
    $scope,
    appConfigs
) {
    $scope.appConfigs = appConfigs;
};

module.exports = () => {
    return {
        scope: {},
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'appConfigs',
            ProfileMenuDirective
        ],
        templateUrl: 'assets/tpl/directives/profile-menu.html' 
    };
};