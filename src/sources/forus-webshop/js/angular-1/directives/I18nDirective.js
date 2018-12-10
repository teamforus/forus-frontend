let I18nDirective = function(
    scope, element, $rootScope, $filter
) {
    let translate = () => {
        element.text($filter('i18n')(scope.i18n, scope.i18nVars));
    };

    $rootScope.$on('$translateChangeSuccess', function() {
        translate();
    });

    translate();
};

module.exports = ['$filter', '$rootScope', ($filter, $rootScope) => {
    return {
        scope: {
            i18n: '@',
            i18nVars: '='
        },
        restrict: "EA",
        link: (scope, element) => I18nDirective(scope, element, $rootScope, $filter)
    };
}];