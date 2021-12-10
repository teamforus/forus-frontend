const CollapseDirective = function(scope, element) {
    angular.element(element[0].querySelectorAll('[collapse-header]')).unbind('click').bind('click', function() {
        angular.element(this.parentElement).toggleClass('active');
    });
};

module.exports = () => {
    return {
        restrict: "EA",
        link: CollapseDirective
    };
};