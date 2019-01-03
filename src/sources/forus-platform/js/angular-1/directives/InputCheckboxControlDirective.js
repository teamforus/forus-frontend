let InputCheckboxControlDirective = function($scope) {
};

module.exports = () => {
    return {
        scope: {
            label: "@",
            name: "@",
            ngModel: '='
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            InputCheckboxControlDirective
        ],
        templateUrl: 'assets/tpl/directives/input-checkbox-control.html' 
    };
};