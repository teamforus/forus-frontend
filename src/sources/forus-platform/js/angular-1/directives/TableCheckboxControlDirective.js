const TableCheckboxControlDirective = function () { };

module.exports = () => {
    return {
        scope: {
            checked: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: TableCheckboxControlDirective,
        templateUrl: 'assets/tpl/directives/table-checkbox-control.html'
    };
};