let LandingAppFooterDirective = function() {};

module.exports = () => {
    return {
        scope: {},
        restrict: "EA",
        replace: true,
        controller: [
            LandingAppFooterDirective
        ],
        templateUrl: 'assets/tpl/directives/landing/landing-app-footer.html'
    };
};