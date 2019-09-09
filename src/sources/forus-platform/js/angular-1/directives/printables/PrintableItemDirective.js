module.exports = [
    '$compile',
    ($compile) => {
        let PrintableDirective = function(scope, element) {
            let template = `
                <${scope.printable.componentType}
                    close = "printable.close"
                    printable = "printable"
                ></${scope.printable.componentType}>
            `;

            element.replaceWith($compile(template)(scope));
        };

        return {
            scope: {
                'printable': '=',
                'close': '='
            },
            restrict: "EA",
            replace: true,
            link: PrintableDirective
        };
    }
];