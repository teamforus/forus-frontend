let UIControlCheckboxDirective = function(
    $scope
) {
    let $dir = {};

    $dir.clear = () => {
        $scope.ngModel = undefined;
    };
    
    $dir.name = $scope.name || '';
    $dir.id = $scope.id || '';
    $dir.ngChange = $scope.ngChange;

    $scope.$dir = $dir;

    $dir.onChange = () => $scope.ngChange();

    if (typeof $scope.controlStyle == 'string') {
        $dir.class = $scope.controlStyle.split(' ').map(style => {
            return 'ui-control-' + style;
        });
    }
};

module.exports = () => {
    return {
        scope: {
            id: "@",
            name: "@",
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