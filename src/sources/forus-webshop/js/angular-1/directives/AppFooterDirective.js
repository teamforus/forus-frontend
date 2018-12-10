let AppFooterDirective = function() {};

module.exports = () => {
    return {
        scope: {},
        restrict: "EA",
        replace: true,
        controller: [
            AppFooterDirective
        ],
        templateUrl: 'assets/tpl/directives/app-footer.html' 
    };
};