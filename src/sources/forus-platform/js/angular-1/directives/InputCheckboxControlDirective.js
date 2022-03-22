const InputCheckboxControlDirective = function($scope) {
    const $dir = $scope.$dir;

    $dir.onChange = (value) => {
        $dir.ngModelCtrl.$setViewValue(value);
    };
};

module.exports = () => {
    return {
        scope: {
            label: "@",
            name: "@",
            fill: '=',
            narrow: '=',
            compact: '=',
            ngModel: '=',
        },
        require: {
            ngModelCtrl: 'ngModel',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope', 
            InputCheckboxControlDirective
        ],
        templateUrl: 'assets/tpl/directives/input-checkbox-control.html' 
    };
};