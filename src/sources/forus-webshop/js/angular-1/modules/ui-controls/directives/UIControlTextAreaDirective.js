let UIControlTextAreaDirective = function(
    $scope
) {
    let $dir = {
        id: $scope.id || '',
        rows: $scope.rows || '',
        name: $scope.name || '',
        placeholder: $scope.placeholder || '',
        onChange: () => $scope.ngChange(),
    };

    $dir.clear = () => {
        $scope.ngModel = undefined;
    };

    if (typeof $scope.controlStyle == 'string') {
        $dir.class = $scope.controlStyle.split(' ').map(style => {
            return 'ui-control-' + style;
        });
    }

    $scope.$dir = $dir;
};

module.exports = () => {
    return {
        scope: {
            id: "@",
            rows: '@',
            name: "@",
            placeholder: "@",
            ngModel: '=',
            controlStyle: '@',
            ngChange: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            UIControlTextAreaDirective
        ],
        template: require('./templates/ui-control-textarea.pug'),
    };
};