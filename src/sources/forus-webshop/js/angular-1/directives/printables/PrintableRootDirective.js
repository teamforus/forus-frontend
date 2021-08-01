const dasherize = require("underscore.string/dasherize");

const PrintablesRootDirective = function($scope, PrintableService, PrintableRoute) {
    const printables = PrintableService.getPrintables();;
    const routePrintables = PrintableRoute.printables();

    $scope.printables = printables;

    $scope.$watch('printables', (printables) => {
        update(printables.filter((printable => !printable.ready)));
    }, true);

    const update = (printables) => {
        printables.forEach(_printable => {
            const printable = _printable;

            printable.ready = true;
            printable.component = routePrintables[printable.key].component;
            printable.componentType = dasherize(routePrintables[printable.key].component);
            printable.close = function() {
                if (typeof printable.events.onClose === 'function') {
                    printable.events.onClose(printable);
                }

                PrintableService.close(printable);
            };
        });
    };
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