const ControlNumericDirective = function($scope) {
    const $dir = $scope.$dir;

    $dir.increase = () => {
        if (!$dir.apply) {
            return $dir.ngModelCtrl.$setViewValue($dir.ngModel + 1);
        }

        $dir.ngModel += 1;
    }

    $dir.decrease = () => {
        if (!$dir.apply) {
            return $dir.ngModelCtrl.$setViewValue($dir.ngModel - 1);
        }

        $dir.ngModel -= 1;
    }

    $dir.submit = () => {
        $dir.ngModelCtrl.$setViewValue($dir.ngModel);
    }
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            minValue: '<',
            maxValue: '<',
            ngModel: '<',
            apply: '<',
            applyText: '@',
        },
        require: {
            ngModelCtrl: 'ngModel',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: ['$scope', ControlNumericDirective],
        template: require('./templates/control-numeric.pug'),
    };
};