const uniqueId = require('lodash/uniqueId');
const isEqual = require('lodash/isEqual');

const SelectControlDirective = function($scope, $timeout) {
    const $dir = $scope.$dir;

    $dir.filter = {
        q: "",
    };

    $dir.prepareOptions = (search) => {
        const options = $dir.optionsPrepared.map((option) => {
            return { ...option, _index: option._name.indexOf(search) };
        }).filter((option) => option._index > -1);

        if (search) {
            options.sort((a, b) => a._index - b._index);
        }

        return options;
    };

    $dir.buildSearchedOptions = () => {
        const search = $dir.filter.q.toLowerCase();
        const search_len = search.length;
        const options = $dir.searchEnabled ? $dir.prepareOptions(search) : $dir.optionsPrepared;

        $dir.optionsFiltered = options.map((option) => {
            const end = -(option[$dir.as].length - (option._index + search_len));
            const nameFormat = $dir.searchEnabled ? [
                option[$dir.as].slice(0, option._index),
                option[$dir.as].slice(option._index, option._index + search_len),
                end < 0 ? option[$dir.as].slice(end) : "",
            ] : [option[$dir.as]];

            return { ...option, nameFormat };
        });
    };

    $dir.searchOption = () => {
        if ($dir.disabled || $dir.ngDisabled) {
            return;
        }

        $dir.showOptions = true;

        if ($dir.searchEnabled && $dir.strict && $dir.value && $dir.value[$dir.as]) {
            $dir.filter.q = $dir.value[$dir.as];
        }

        $dir.buildSearchedOptions();
    };

    $dir.searchKeydown = (e) => {
        if (e.key == 'Enter') {
            $dir.showOptions = false;
            $dir.searchUpdate();
        }
    };

    $dir.searchUpdate = () => {
        if (typeof $dir.ngChangeSearch == 'function') {
            $dir.ngChangeSearch({
                value: $dir.filter.q
            });
        }
    };

    $dir.searchInputChanged = () => {
        $dir.buildSearchedOptions();
    };

    $dir.selectOption = (option) => {
        $dir.setModel(option.raw);
        $dir.showOptions = false;
    };

    $dir.onClickOutside = () => {
        $timeout(() => {
            $dir.showOptions = false;
        }, 0);
    };

    $dir.setModel = (value) => {
        $dir.value = value;
        $dir.filter.q = value[$dir.as];

        $dir.ngModelCtrl.$setViewValue($dir.prop ? value[$dir.prop] : value);
        $dir.searchUpdate();
    };

    $scope.$watch(function () {
        return $dir.ngModelCtrl.$modelValue;
    }, function(newValue) {
        if (Array.isArray($dir.options)) {
            $dir.value = $dir.findValue($dir.ngModel);
        }
    });

    $dir.onInputClick = () => {
        if ($dir.autoClearEnabled) {
            $dir.filter.q = "";
        }

        $dir.searchInputChanged();
    }

    $dir.findValue = (ngModel) => {
        return $dir.options.filter((option) => {
            if ($dir.strict) {
                return $dir.prop ? option[$dir.prop] === ngModel : isEqual(option, ngModel);
            }

            return $dir.prop ? option[$dir.prop] == ngModel : isEqual(option, ngModel);
        })[0] || null
    }

    $dir.$onInit = () => {
        $dir.as = typeof $dir.as === 'undefined' ? 'name' : $dir.as;
        $dir.prop = typeof $dir.prop === 'undefined' ? null : $dir.prop;
        $dir.mode = typeof $dir.mode === 'undefined' ? 'strict' : $dir.mode;
        $dir.searchEnabled = typeof $dir.search === 'undefined' ? true : $dir.search;
        $dir.autoClearEnabled = typeof $dir.autoClear === 'undefined' ? true : $dir.autoClear;

        $dir.strict = $dir.mode === 'strict';
        $dir.controlId = 'select_control_' + uniqueId();
        $dir.showOptions = false;
        $dir.optionsPreloadSize = $dir.optionsPreloadSize || 50;
        $dir.optionsPrepared = [];
        $dir.optionsFiltered = [];

        $scope.$watch('$dir.options', (options) => {
            if (!Array.isArray(options)) {
                return;
            }

            $dir.optionsPrepared = JSON.parse(JSON.stringify(options)).map((option) => {
                return { ...option, _name: option[$dir.as].toString().toLowerCase(), raw: { ...option } };
            });

            $dir.buildSearchedOptions();

            $dir.value = $dir.findValue($dir.ngModel);
        });

        if (typeof $dir.ngChangeQuery == 'function') {
            $scope.$watch('$scope.$dir.filter.q', (value, prev) => {
                $dir.ngChangeQuery({
                    value: value && $dir.prop ? value[$dir.prop] || null : value,
                    prev: prev && $dir.prop ? prev[$dir.prop] || null : prev
                });
            });
        }
    }
};

module.exports = () => {
    return {
        scope: {
            mode: '@',
            placeholder: "@",
            multiple: "=",
            prop: "@",
            as: "@",
            search: "=",
            options: "=",
            autoClear: "=",
            ngModel: '=',
            disabled: '@',
            ngDisabled: '=',
            ngChange: '&',
            ngChangeQuery: '&',
            ngChangeSearch: '&',
            optionsPreloadSize: "@"
        },
        require: {
            ngModelCtrl: 'ngModel',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$timeout',
            SelectControlDirective
        ],
        template: require('./templates/select-control.pug'),
    };
};