let UIControlDateDirective = function(
    $scope
) {
    let $dir = {
        id: $scope.id || '',
        name: $scope.name || '',
        placeholder: $scope.placeholder || '',
        dateFormat: $scope.dateFormat || 'dd-MM-yyyy',
    };

    $dir.clear = () => {
        $scope.ngModel = undefined;
    };

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
            placeholder: "@",
            ngModel: '=',
            dateFormat: "@",
            controlStyle: '@',
            ngChange: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            UIControlDateDirective
        ],
        template: require('./templates/ui-control-date.pug')
    };
};