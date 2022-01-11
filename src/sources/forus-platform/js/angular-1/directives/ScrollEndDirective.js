const ScrollEndDirective = function($scope, $element) {
    const threshold = $scope.threshold ? parseInt($scope.threshold) : 10;

    const scrollHandler = function() {
        const top = $element[0].scrollTop + $element[0].clientHeight;

        if (top >= ($element[0].scrollHeight - threshold)) {
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
            'threshold': '='
        },
        restrict: "EA",
        link: ScrollEndDirective
    };
};