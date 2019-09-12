let ScrollEndDirective = function($scope, $element) {
    let trashold = $scope.trashold ? parseInt($scope.trashold) : 10;
    let scrollHandler = function() {
        let top = $element.scrollTop() + $element.innerHeight();

        if (top >= ($element[0].scrollHeight - trashold)) {
            $scope.scrollEnd();
        }
    };

    $element[0].addEventListener('scroll', scrollHandler, false);

    $scope.$on('$destroy', function() {
        $element[0].removeEventListener('scroll', scrollHandler, false);
    });
};

module.exports = () => {
    return {
        scope: {
            'scrollEnd': '&',
            'trashold': '='
        },
        restrict: "EA",
        link: ScrollEndDirective
    };
};