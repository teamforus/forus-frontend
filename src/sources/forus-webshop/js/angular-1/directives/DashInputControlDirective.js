let DashInputControlDirective = function(
    $scope,
    $element
) {
    let dashInterval = parseInt($scope.blockSize || 4);
    let maxLength = parseInt($scope.maxLength || 8);
    let index = Math.floor(Math.random() * 100000) + 1;

    // prevent invalid inpit
    angular.element($element).bind('keypress.dash_control_' + index, function(e) {
        var key = e.which;
        var isValid = key >= 65 && key <= 90 || // A-Z
            key >= 97 && key <= 122 || // a-z
            key >= 48 && key <= 57; // 0-9

        if (!isValid) {
            e.preventDefault();
        }
    });

    // add dashes
    $scope.$watch('ngModel', function(_new, _old, $scope) {
        let str = _new.split('-').join('').split('');
        let strOut = '';

        if (_new + '-' == _old) {
            return $scope.ngModel = _new;
        }

        if (str.length <= maxLength) {
            while (str.length > 0) {
                let strChunk = str.splice(0, dashInterval).join('');
                strOut += strChunk;

                if (strChunk.length == dashInterval && str.length != 0) {
                    strOut += '-';
                }
            }

            $scope.ngModel = strOut;
        } else {
            $scope.ngModel = _old;
        }
    });

    $scope.$on('$destroy', function() {
        angular.element($element).bind('keypress.dash_control_' + index);
    });
};

module.exports = () => {
    return {
        scope: {
            ngModel: '=',
            maxLength: '@',
            blockSize: '@',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$element',
            DashInputControlDirective
        ]
    };
};