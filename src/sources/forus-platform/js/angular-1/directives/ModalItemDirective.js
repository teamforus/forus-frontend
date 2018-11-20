module.exports = [
    '$compile',
    '$timeout',
    ($compile, $timeout) => {
        let ModalDirective = function(scope, element, attributes) {
            let template = `
                <${scope.modal.componentType}
                    close = "modal.close"
                    modal = "modal"
                ></${scope.modal.componentType}>
            `;

            element.replaceWith($compile(template)(scope));
        };

        return {
            scope: {
                'modal': '=',
                'close': '='
            },
            restrict: "EA",
            replace: true,
            link: ModalDirective
        };
    }
];