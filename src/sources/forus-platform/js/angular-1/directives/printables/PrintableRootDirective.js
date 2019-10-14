let PrintablesRootDirective = function($scope, PrintableService, PrintableRoute) {
    let routePrintables = PrintableRoute.printables();

    $scope.printables = PrintableService.getPrintables();

    $scope.$watch('printables', (printables) => {
        update(printables.filter((printable => !printable.ready)));
    }, true);

    let update = (printables) => {
        printables.forEach(_printable => {
            let printable = _printable;

            printable.ready = true;
            printable.component = routePrintables[printable.key].component;
            printable.componentType = require("underscore.string/dasherize")(
                routePrintables[printable.key].component
            );
            printable.close = function() {
                if (typeof(printable.events.onClose) === 'function') {
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