let UIControlSearchInputDirective = function(
    $scope
) {
    let $dir = {};

    $dir.clear = () => {
        $scope.ngModel = undefined;
    };
    
    $dir.name = $scope.name || '';
    $dir.id = $scope.id || '';
    $dir.class = $scope.class || '';
    $dir.placeholder = $scope.placeholder || '';
    $dir.inputDusk = $scope.inputDusk || '';
    $dir.tabindex = $scope.tabindex || 0;
    $dir.ariaLabel = $scope.ariaLabel || '';
    $dir.ngChange = $scope.ngChange;
    $dir.ngClick = $scope.ngClick;
    $dir.ngKeyDown = $scope.ngKeyDown;

    $scope.$dir = $dir;

    $dir.onChange = () => $scope.ngChange();

    $dir.onClick = () => $scope.ngClick();

    $dir.onKeyDown = () => $scope.ngKeyDown();
};

module.exports = () => {
    return {
        scope: {
            id: "@",
            name: "@",
            class: "@",
            placeholder: "@",
            inputDusk: "@",
            tabindex: "@",
            ariaLabel: "@",
            ngModel: '=',
            ngChange: '&',
            ngClick: '&',
            ngKeyDown: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            UIControlSearchInputDirective
        ],
        template: require('./templates/ui-control-search-input.pug')
    };
};