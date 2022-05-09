let PincodeControlDirective = function(
    $scope,
    $timeout,
    $element
) {
    let blockInputType = $scope.blockInputType = ($scope.blockInputType || 'num');
    let blockSize = $scope.blockSize = $scope.blockSize || 6;
    let blockCount = $scope.blockCount = $scope.blockCount || 1;
    let totalSize = blockSize * blockCount;
    let $input = angular.element($element[0].querySelector('.hidden-input'));
    let len = 0;
    let inputTypes = ['insertText', 'insertCompositionText', 'deleteContentBackward'];
    let eventListener = null;

    let isIe = () => {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
            return true;
        }

        return false;
    }

    $scope.type = blockInputType === 'num' ? 'tel' : 'text';
    $scope.pattern = {
        num: /^[0-9]+$/,
        alpha: /^[a-zA-Z]+$/,
        alphanum: /^[0-9a-zA-Z]+$/,
    };

    $scope.isIe = isIe();

    if (!$scope.isIe) {
        $input[0].focus();
        $input.val([...Array(1000).keys()].join(''));
        $element.on('click', (e) => $input[0].focus());
    }

    $scope.cantDeleteLength = $scope.cantDeleteLength ? $scope.cantDeleteLength : 0;

    $scope.updateInput = () => {
        let chars = [];
        let charCount = 0;
        let flag = false;

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
                if (!flag) {
                    flag = true;
                    chars.push('active');
                } else {
                    chars.push('_');
                }

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

    let bind = () => {
        if (!$scope.isIe) {
            $input.bind('input', (e) => {
                let data = e.data;

                if (inputTypes.indexOf(e.inputType) === -1) {
                    return;
                }

                $timeout(() => $scope.addCharCode(null, typeof data == 'string' ? data.slice(-1) : '', e));

                return false;
            });
        }

        eventListener = (e) => {
            if ($scope.isIe || $input[0] !== e.target) {
                $timeout(() => $scope.addCharCode(e.charCode || e.keyCode || 0, null, e), 0);
            }

            if ($scope.isIe && ((e.charCode || e.keyCode) === 8)) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        document.body.addEventListener('keydown', eventListener);
    };

    $scope.addCharCode = function(key, value, e) {
        let _delete = false;
        let handled = false;

        if (typeof $scope.ngModel != 'string') {
            $scope.ngModel = '';
        }

        if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
            $element.val($scope.ngModel)
            return false;
        }

        if (e.type === 'input') {
            _delete = !e.data || (e.data.length < len);
            len = e.data ? e.data.length : 0;
        }

        if (_delete || key == 8 || key == 46 || e.inputType == 'deleteContentBackward') {
            if ($scope.ngModel.length > $scope.cantDeleteLength) {
                $scope.ngModel = $scope.ngModel.slice(0, $scope.ngModel.length - 1);
            }

            return $element.val($scope.ngModel)
        }

        if (blockInputType == 'alphanum' || blockInputType == 'num') {
            if (e.type == 'input') {
                if ((new RegExp($scope.pattern.num).test(value)) && $scope.ngModel.length < totalSize) {
                    $scope.ngModel += value.toString();
                    handled = true;
                }
            } else {
                // Numbers
                if ((key >= 48 && key <= 57)) {
                    if ($scope.ngModel.length < totalSize) {
                        $scope.ngModel += (key - 48).toString();
                    }

                    handled = true;
                }

                // Numbers from numpad
                if ((key >= 96 && key <= 105)) {
                    if ($scope.ngModel.length < totalSize) {
                        $scope.ngModel += (key - 96).toString();
                    }
                }
            }
        }

        if (blockInputType == 'alphanum' || blockInputType == 'alpha') {
            if (e.type == 'input') {
                if ((new RegExp($scope.pattern.alpha).test(value)) && $scope.ngModel.length < totalSize) {
                    $scope.ngModel += value.toString();
                    handled = true;
                }
            } else {
                if ((key >= 65 && key <= 90) || (key >= 97 && key <= 122)) {
                    if ($scope.ngModel.length < totalSize) {
                        $scope.ngModel += e.key || e.data[e.data.length - 1];
                    }

                    handled = true;
                }
            }
        }

        if (!handled) {
            e.preventDefault();

            if ($input.val()) {
                $input.val($input.val().slice(0, -1));
            }
        }

        $element.val($scope.ngModel)
        $scope.updateInput();
    };

    $scope.updateInput();
    $scope.$on('$destroy', function() {
        document.body.removeEventListener('keydown', eventListener);
    });

    bind();
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
            '$element',
            PincodeControlDirective
        ],
        templateUrl: 'assets/tpl/directives/pincode-control.html'
    };
};