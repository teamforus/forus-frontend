let UIControlStepDirective = function(
    $scope
) {
    let $dir = {
        id: $scope.id || '',
        name: $scope.name || '',
    };

    $dir.increase = (amount = 1) => {
        $scope.set($scope.max ? Math.min(
            $scope.ngModel + amount, $scope.max
        ) : $scope.ngModel + amount);
    };

    $dir.decrease = (amount = 1) => {
        $scope.set($scope.min ? Math.max(
            $scope.ngModel - amount, $scope.min
        ) : $scope.ngModel - amount);
    };

    $scope.set = (value) => {
        let prev = $scope.ngModel;

        $dir.value = $scope.ngModel = value;

        if (value != prev) {
            $scope.ngChange();
        }
    };

    $scope.$watch('ngModel', function(val) {
        $dir.value = val;
    });

    $scope.$dir = $dir;

    if (isNaN(parseInt($scope.ngModel))) {
        throw new Error("Invalid ngModel.");
    }

    if (typeof $scope.controlStyle == 'string') {
        $dir.class = $scope.controlStyle.split(' ').map(style => {
            return 'ui-control-' + style;
        });
    }

    $scope.set(parseInt($scope.ngModel));
};

module.exports = () => {
    return {
        scope: {
            id: "@",
            name: "@",
            ngModel: '=',
            min: '@',
            max: '@',
            controlStyle: '@',
            ngChange: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            UIControlStepDirective
        ],
        template: require('./templates/ui-control-step.pug'),
    };
};