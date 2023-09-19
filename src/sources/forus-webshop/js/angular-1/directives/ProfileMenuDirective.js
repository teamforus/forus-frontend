const ProfileMenuDirective = function($scope, $state, appConfigs) {
    $scope.$dir = { appConfigs };

    $scope.$dir.$state = $state;
};

module.exports = () => {
    return {
        scope: {},
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            'appConfigs',
            ProfileMenuDirective
        ],
        templateUrl: 'assets/tpl/directives/profile-menu.html'
    };
};