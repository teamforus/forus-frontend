let DashboardSwitcherDirective = function() { };

module.exports = () => {
    return {
        restrict: "EA",
        replace: true,

        controller: [
            DashboardSwitcherDirective
        ],
        templateUrl: 'assets/tpl/directives/dashboard-switcher.html'
    };
};