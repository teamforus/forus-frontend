module.exports = [
    '$compile',
    ($compile) => {
        let ModalDirective = function(scope, element) {
            let template = `
                <${scope.modal.componentType}
                    modal-window-middle
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