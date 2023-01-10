const UIControlEmailDirective = function($scope, $element) {
    const $dir = {
        id: $scope.id || '',
        name: $scope.name || '',
        tabindex: $scope.tabindex || null,
        inputDusk: $scope.inputDusk || '',
        autoFocus: $scope.autoFocus || false,
        placeholder: $scope.placeholder || '',
        onChange: () => $scope.ngChange(),
    };

    $dir.clear = () => {
        $scope.ngModel = undefined;
    };

    if (typeof $scope.controlStyle == 'string') {
        $dir.class = $scope.controlStyle.split(' ').map((style) => `ui-control-${style}`);
    }

    if ($dir.autoFocus) {
        $element.find('input')[0]?.focus();
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
            autoFocus: '=',
            tabindex: '@',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$element',
            UIControlEmailDirective
        ],
        template: require('./templates/ui-control-email.pug'),
    };
};