module.exports = [() => {
    let ModalWindowMiddleDirective = function(scope, element) {
        let onResize = () => {
            element.css('margin-left', -(parseInt(element.innerWidth() / 2)));
            element.css('margin-top', -(parseInt(element.innerHeight() / 2)));
        }

        new ResizeSensor(element, onResize);
        onResize();
    };

    return {
        restrict: "EA",
        replace: true,
        link: ModalWindowMiddleDirective
    };
}];