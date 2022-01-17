const ModalItemDirective = ($compile) => {
    const ModalDirective = function (scope, element) {
        const template = `
            <${scope.modal.componentType}
                close ="modal.close"
                modal = "modal"
            ></${scope.modal.componentType}>
        `;

        const $element = $compile(template)(scope);

        element.replaceWith($element);
        scope.modal.getElement = () => $element;
    };

    return {
        scope: {
            'close': '=',
            'modal': '=',
        },
        restrict: "EA",
        replace: true,
        link: ModalDirective,
    };
};

module.exports = [
    '$compile',
    ModalItemDirective,
];