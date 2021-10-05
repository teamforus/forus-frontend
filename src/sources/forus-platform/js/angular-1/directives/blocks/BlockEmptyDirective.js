const BlockEmptyDirective = function($scope) {
    $scope.align = $scope.align || 'center';
};

module.exports = () => {
    return {
        scope: {
            title: '@',
            text: '@',
            button: '=',
            align: '@',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            BlockEmptyDirective
        ],
        templateUrl: 'assets/tpl/directives/blocks/block-empty.html'
    };
};