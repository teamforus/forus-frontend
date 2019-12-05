let ClickOutsideDirective = function($scope, $element) {
    let body = document.querySelector('body');
    
    let clickHandler = function(e) {
        let targetElement = e.target;

        do {
            if (targetElement == $element[0]) {
                return;
            }

            targetElement = targetElement.parentNode;
        } while (targetElement);

        $scope.clickOutside({
            '$event': e
        });
    };


    body.addEventListener('click', clickHandler, false);

    $scope.$on('$destroy', function() {
        body.removeEventListener('click', clickHandler, false);
    });
};

module.exports = () => {
    return {
        scope: {
            'clickOutside': '&'
        },
        restrict: "EA",
        link: ClickOutsideDirective 
    };
};