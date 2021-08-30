const kebabCase = require("lodash/kebabCase");

const PrintablesRootDirective = function($scope, PrintableService, PrintableRoute) {
    const printables = PrintableService.getPrintables();
    const routePrintables = PrintableRoute.printables();

    const update = (printables) => {
        printables.forEach(_printable => {
            const printable = _printable;

            printable.ready = true;
            printable.component = routePrintables[printable.key].component;
            printable.componentType = kebabCase(routePrintables[printable.key].component);

            printable.close = function() {
                if (typeof printable.events.onClose === 'function') {
                    printable.events.onClose(printable);
                }

                PrintableService.close(printable);
            };
        });
    };

    $scope.printables = printables;

    $scope.$watch('printables', (printables) => update(printables.filter((printable) => {
        return !printable.ready;
    })), true);
};

module.exports = () => {
    return {
        restrict: "EA",
        controller: [
            '$scope',
            'PrintableService',
            'PrintableRoute',
            PrintablesRootDirective
        ],
        templateUrl: 'assets/tpl/directives/printables-root.html'
    };
};