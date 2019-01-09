let FormLabelToggleDirective = function($scope) {};

module.exports = () => {
    return {
        scope: {
            label: '@',
            isActive: '@',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            FormLabelToggleDirective
        ],
        templateUrl: 'assets/tpl/directives/form-label-toggle.html' 
    };
};