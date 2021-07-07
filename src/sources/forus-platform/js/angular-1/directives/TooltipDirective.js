const TooltipDirective = function($scope, $filter ) {
    if (typeof $scope.text === 'string') {
        $scope.text = $filter('i18n')($scope.text);
        $scope.lines = [$scope.text];
    } else if (Array.isArray($scope.text)) {
        $scope.lines = $scope.text;
    }
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