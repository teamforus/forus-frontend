let UIControlNumberDirective = function($scope) {
    let $dir = {
        id: $scope.id || '',
        name: $scope.name || '',
        placeholder: $scope.placeholder || '',
        step: $scope.step || 1,
        min: $scope.min || 0,
        max: $scope.max || 99999999999,
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
            min: '@',
            max: '@',
            step: '@',
            controlStyle: '@',
            ngChange: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            UIControlNumberDirective
        ],
        template: require('./templates/ui-control-number.pug'),
    };
};