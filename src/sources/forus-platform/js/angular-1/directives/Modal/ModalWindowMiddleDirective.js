module.exports = [() => {
    let FloatCenterDirective = function(scope, element) {
        let modalWindow = element.find('.modal-window');
        let onResize = () => {
            modalWindow.css('margin-left', -(parseInt(modalWindow.innerWidth() / 2)));
            modalWindow.css('margin-top', -(parseInt(modalWindow.innerHeight() / 2)));
        }

        new ResizeSensor(modalWindow, onResize);
        onResize();
    };

    return {
        restrict: "EA",
        replace: true,
        link: FloatCenterDirective
    };
}];