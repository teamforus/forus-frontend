let DashboardSwitcherDirective = function($scope){
    $scope.hideDashboardSwitcher = false;
    
    $scope.$watchCollection(() => [$scope.$root.viewLayout, $scope.$root.auth_user], ([viewLayout, auth_user]) => {
        $scope.hideDashboardSwitcher = !auth_user || viewLayout == 'signup';
    });
};

module.exports = () => {
    return {
        restrict: "EA",
        replace: true,

        controller: [
            '$scope',
            DashboardSwitcherDirective
        ],
        templateUrl: 'assets/tpl/directives/dashboard-switcher.html' 
    };
};