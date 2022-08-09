const UIControlEmailDirective = function($scope) {
    const $dir = {
        id: $scope.id || '',
        name: $scope.name || '',
        inputDusk: $scope.inputDusk || '',
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
            inputDusk: "@",
            placeholder: "@",
            ngModel: '=',
            controlStyle: '@',
            ngChange: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            UIControlEmailDirective
        ],
        template: require('./templates/ui-control-email.pug'),
    };
};