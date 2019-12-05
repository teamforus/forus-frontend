let UIControlCurrencyDirective = function(
    $scope
) {
    let $dir = {};

    $dir.clear = () => {
        $scope.ngModel = undefined;
    };
    
    $dir.currency = $scope.currency || '€';
    $dir.name = $scope.name || '';
    $dir.id = $scope.id || '';
    $dir.step = $scope.step || .01;
    $dir.min = $scope.min || 0;
    $dir.max = $scope.max || 99999999999;
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
            placeholder: "@",
            ngModel: '=',
            min: '@',
            max: '@',
            step: '@',
            currency: "@",
            controlStyle: '@',
            ngChange: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            UIControlCurrencyDirective
        ],
        template: require('./templates/ui-control-currency.pug')
    };
};