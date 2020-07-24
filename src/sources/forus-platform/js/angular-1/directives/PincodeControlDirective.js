let PincodeControlDirective = function(
    $scope,
    $timeout
) {
    let blockInputType = $scope.blockInputType || 'num';
    let blockSize = $scope.blockSize || 6;
    let blockCount = $scope.blockCount || 1;
    let totalSize = blockSize * blockCount;

    $scope.cantDeleteLength = $scope.cantDeleteLength ? $scope.cantDeleteLength : 0;

    $scope.updateInput = () => {
        let chars = [];
        let charCount = 0;

        if ($scope.ngModel && typeof $scope.ngModel == 'string') {
            $scope.ngModel.split('').forEach((char) => {
                chars.push(char);
                charCount++;

                if (charCount > 0 && (charCount % blockSize == 0) && charCount < totalSize) {
                    chars.push('split');
                }
            });
        }

        if ($scope.filler && $scope.filler.length > 0) {
            for (let index = 0; index < $scope.filler.length; index++) {
                chars.push('_');
                charCount++;

                if (charCount > 0 && (charCount % blockSize == 0) && charCount < totalSize) {
                    chars.push('split');
                }
            }
        }

        $scope.chars = chars;
    };

    $scope.$watch('ngModel', function() {
        $scope.filler = new Array(Math.max(totalSize - (
            $scope.ngModel ? ($scope.ngModel.toString().length) : 0
        ), 0));

        $scope.updateInput();
    });

    $('.hidden-input').bind('keydown', (e) => {
        var key = e.charCode || e.keyCode || 0;

        e.stopPropagation();

        return ((key >= 48 && key <= 57) || (key >= 96 && key <= 105) || (key >= 65 && key <= 90)) &&
            $scope.ngModel.length < totalSize;
    }).bind('paste', (e) => e.preventDefault() && e.stopPropagation());

    $('body').bind('keydown', (e) => {
        $timeout(function() {
            var key = e.charCode || e.keyCode || 0;

            if (e.originalEvent.ctrlKey || e.originalEvent.shiftKey || e.altKey || e.metaKey) {
                return false;
            }

            if (key == 8 || key == 46) {
                if ($scope.ngModel.length - $scope.cantDeleteLength > 0) {
                    $scope.ngModel = $scope.ngModel.slice(0, $scope.ngModel.length - 1);
                }
            }

            if (blockInputType == 'alphanum' || blockInputType == 'num') {
                // Numbers
                if ((key >= 48 && key <= 57)) {
                    if (!$scope.ngModel) {
                        $scope.ngModel = '';
                    }

                    if ($scope.ngModel.length < totalSize) {
                        $scope.ngModel += (key - 48).toString();
                    }
                }

                // Numbers from numpad
                if ((key >= 96 && key <= 105)) {
                    if (!$scope.ngModel) {
                        $scope.ngModel = '';
                    }

                    if ($scope.ngModel.length < totalSize) {
                        $scope.ngModel += (key - 96).toString();
                    }
                }
            }

            if (blockInputType == 'alphanum' || blockInputType == 'alpha') {
                // A-z from numpad
                if (key >= 65 && key <= 90) {
                    if (!$scope.ngModel) {
                        $scope.ngModel = '';
                    }

                    if ($scope.ngModel.length < totalSize) {
                        $scope.ngModel += e.originalEvent.key;
                    }
                }
            }

            $scope.updateInput();
        }, 0);
    });

    $scope.updateInput();
};

module.exports = () => {
    return {
        scope: {
            ngModel: '=',
            blockSize: '@',
            blockCount: '@',
            blockInputType: '@',
            cantDeleteLength: '=?',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$timeout',
            PincodeControlDirective
        ],
        templateUrl: 'assets/tpl/directives/pincode-control.html'
    };
};