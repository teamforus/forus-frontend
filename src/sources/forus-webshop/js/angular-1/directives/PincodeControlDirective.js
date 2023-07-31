const { chunk } = require('lodash');

const PincodeControl2Directive = function (
    $scope,
    $element,
    $timeout,
) {
    const $dir = $scope.$dir;

    const pattern = {
        num: /^[0-9]+$/,
        alpha: /^[a-zA-Z]+$/,
        alphaNum: /^[0-9a-zA-Z]+$/,
    };

    const isValid = (char, type) => {
        if (type == 'alphaNum') {
            return new RegExp(pattern.alphaNum).test(char);
        }

        if (type == 'alpha') {
            return new RegExp(pattern.alpha).test(char);
        }

        if (type == 'num') {
            return new RegExp(pattern.num).test(char);
        }

        return false;
    }

    const selectInputRange = (input) => {
        const isMobile = (window.innerWidth <= 800) && (window.innerHeight <= 800);
        input?.setSelectionRange(isMobile ? input?.value.length : 0, input?.value.length);
        input?.focus();

        $timeout(() => {
            input?.setSelectionRange(isMobile ? input?.value.length : 0, input?.value.length);
            input?.focus();
        }, 0);
    };

    const setCursor = (cursor) => {
        $dir.cursor = cursor;
        $dir.getInput($dir.cursor)?.focus();
        selectInputRange($dir.getInput($dir.cursor));
    }

    const setText = (text) => {
        const suffix = $dir.ngModel.substring(0, $dir.immutableSize);
        const textValue = text.substring($dir.immutableSize, $dir.totalSize);

        $dir.ngModelCtrl.$setViewValue(suffix + textValue);
        $dir.ngModel = suffix + textValue;
        $dir.buildChars();
    };

    $dir.getInputs = () => {
        return $element.find('input');
    };

    $dir.getInput = (index) => {
        return $element.find('input')[index];
    };

    $dir.onFocus = (e) => {
        e.target.placeholder = '';
    };

    $dir.onBlur = (e) => {
        e.target.placeholder = '_';
    };

    $dir.onKeyDown = (e, char) => {
        const index = $dir.chars.indexOf(char);
        const arr = $dir.ngModel.split('');
        const hasText = $dir.getInputs()[index].value.length > 0;

        if (e.key == 'Backspace') {
            e.preventDefault();
            arr[index] = ' ';

            if (!hasText) {
                arr[index - 1] = ' ';
            }

            setText(arr.join(''));
            setCursor(Math.max($dir.immutableSize, hasText ? index : index - 1));
        }

        if (e.key == 'ArrowLeft') {
            e.preventDefault();
            setCursor(Math.max($dir.immutableSize, index - 1));
        }

        if (e.key == 'ArrowRight') {
            e.preventDefault();
            setCursor(Math.min($dir.chars.length - 1, index + 1));
        }

        if (e.currentTarget.value == e.key) {
            e.preventDefault();
            setCursor(Math.min($dir.chars.length - 1, index + 1));
        }
    }

    $dir.onChange = (char) => {
        const index = $dir.chars.indexOf(char);
        const targetValue = $dir.getInput(index).value;

        const text = targetValue.substring(0).split('').map((item) => {
            return isValid(item, $dir.blockInputType) ? item : '';
        }).join('');

        const newText =
            $dir.ngModel.substring(0, index).padEnd(index, ' ') +
            text +
            $dir.ngModel.substring(index + text.length, $dir.ngModel.length);

        setText(newText);
        setCursor(Math.min($dir.totalSize - 1, index + text.length));
    };

    $dir.onClick = (e, char) => {
        const index = $dir.chars.indexOf(char);
        e.stopPropagation();
        setCursor(index);
    };

    $dir.buildChars = () => {
        const chars = $dir.ngModel.padEnd($dir.totalSize, ' ').split('').map((val) => ({ val: val.trim() }));

        if (!$dir.chars || $dir.chars.length != chars.length) {
            $dir.chars = chars;
        } else {
            chars.forEach((element, index) => $dir.chars[index].val = element.val);
        }

        $dir.charChunks = chunk($dir.chars, $dir.blockSize);
        $dir.immutableSize = Math.min($dir.cantDeleteLength, $dir.ngModel.toString().length);
    };

    $dir.$onInit = () => {
        $dir.ngModel = ($dir.ngModel || '').toString();
        $dir.blockInputType = $dir.blockInputType || 'num';
        $dir.type = $dir.blockInputType === 'num' ? 'tel' : 'text';
        $dir.blockSize = $dir.blockSize || 6;
        $dir.blockCount = $dir.blockCount || 1;
        $dir.totalSize = $dir.blockSize * $dir.blockCount;
        $dir.cantDeleteLength = $dir.cantDeleteLength ? $dir.cantDeleteLength : 0;

        $dir.buildChars();

        const cancel = $scope.$watch(() => $dir.getInputs().length > 0, function (inputs) {
            if (!inputs) {
                return;
            }

            cancel();
            setCursor(Math.max(0, $dir.immutableSize));
            $scope.$watch('$dir.ngModel', () => $dir.buildChars());
        });
    }
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
        require: {
            ngModelCtrl: 'ngModel',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$element',
            '$timeout',
            PincodeControl2Directive,
        ],
        // template: require('../../../pug/tpl/directives/pincode-control.pug'),
        templateUrl: 'assets/tpl/directives/pincode-control.html'
    };
};