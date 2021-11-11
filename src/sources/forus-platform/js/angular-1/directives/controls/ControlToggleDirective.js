const ControlToggleDirective = function() {};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            ngModel: '<',
            formName: '@',
            formId: '@',
            label: '@',
            labelClass: '@',
            disabled: '=',
            off: '=',
        },
        require: {
            ngModelCtrl: 'ngModel',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: ControlToggleDirective,
        template: require('./templates/control-toggle.pug'),
    };
};