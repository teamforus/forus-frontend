const InputCheckboxControlDirective = function() {};

module.exports = () => {
    return {
        scope: {
            label: "@",
            name: "@",
            compact: '=',
            ngModel: '=',
        },
        restrict: "EA",
        replace: true,
        controller: InputCheckboxControlDirective,
        templateUrl: 'assets/tpl/directives/input-checkbox-control.html' 
    };
};