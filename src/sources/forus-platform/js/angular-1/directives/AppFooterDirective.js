let AppFooterDirective = function() { };

module.exports = () => {
    return {
        restrict: "EA",
        replace: true,

        controller: [AppFooterDirective],
        templateUrl: "assets/tpl/directives/app-footer-directive.html",
    };
};
