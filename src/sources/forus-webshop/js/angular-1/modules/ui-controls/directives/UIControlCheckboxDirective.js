let UIControlCheckboxDirective = function(
    $scope
) {
    let $dir = {
        id: $scope.id,
        name: $scope.name,
        label: $scope.label,
        onChange: $scope.ngChange
    };

    $dir.clear = () => {
        $scope.ngModel = undefined;
    };

    $dir.ngChange = $scope.ngChange;

    $dir.onChange = () => $scope.ngChange();

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
            label: "@",
            ngModel: '=',
            controlStyle: '@',
            ngChange: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            UIControlCheckboxDirective
        ],
        template: require('./templates/ui-control-checkbox.pug')
    };
};