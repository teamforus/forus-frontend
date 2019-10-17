let UIControlTextDirective = function(
    $scope
) {
    let $dir = {
        id: $scope.id || '',
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
            UIControlTextDirective
        ],
        template: require('./templates/ui-control-text.pug'),
    };
};