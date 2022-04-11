let ScrollToDirective = function(scope, element, attributes) {
    angular.element(element).bind('click', function() {
        const target = document.querySelector(attributes.scrollTo);

        if (target) {
            target.scrollIntoView();
        }
    });
};

module.exports = () => {
    return {
        restrict: "EA",
        link: ScrollToDirective
    };
};