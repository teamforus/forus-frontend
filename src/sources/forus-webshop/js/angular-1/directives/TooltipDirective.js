let TooltipDirective = function($scope, $filter) {
    $scope.text = $filter('i18n')($scope.text);
};

module.exports = () => {
    return {
        scope: {
            'text': '<',
            'tooltipType': '@'
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$filter',
            TooltipDirective
        ],
        templateUrl: 'assets/tpl/directives/tooltip-directive.html'
    };
};