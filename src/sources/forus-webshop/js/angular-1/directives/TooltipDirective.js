let TooltipDirective = function(
    $scope,
    $element,
    $filter
) {
    $scope.text = $filter('i18n')($scope.text);
};

module.exports = () => {
    return {
        scope: {
            'text': '<'
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$element',
            '$filter',
            TooltipDirective
        ],
        templateUrl: 'assets/tpl/directives/tooltip-directive.html'
    };
};