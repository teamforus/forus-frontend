const ProfileMenuDirective = function($scope, appConfigs) {
    $scope.$dir = { appConfigs };
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