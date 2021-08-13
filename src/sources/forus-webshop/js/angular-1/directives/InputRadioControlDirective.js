const InputRadioControlDirective = function() { };

module.exports = () => {
    return {
        scope: {
            fill: '=',
            label: "@",
            value: "@",
            name: "@",
            compact: '=',
            ngModel: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [InputRadioControlDirective],
        templateUrl: 'assets/tpl/directives/input-radio-control.html'
    };
};