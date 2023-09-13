const uniqueId = require('lodash/uniqueId');

const SelectControlDirective = function ($scope, $timeout) {
    const $dir = $scope.$dir;

    $dir.filter = {
        q: "",
    };

    $dir.clear = () => {
        $scope.$dir.filter.q = '';
        $dir.searchInputChanged();
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
        const search = $dir.filter.q?.toString().toLowerCase();
        const search_len = search.length;
        const options = $dir.searchEnabled ? $dir.prepareOptions(search) : $dir.optionsPrepared;

        $dir.optionsFiltered = options.map((option) => {
            const end = -(option.raw[$dir.as].length - (option._index + search_len));
            const nameFormat = $dir.searchEnabled ? [
                option.raw[$dir.as].slice(0, option._index),
                option.raw[$dir.as].slice(option._index, option._index + search_len),
                end < 0 ? option.raw[$dir.as].slice(end) : "",
            ] : [option.raw[$dir.as]];

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
        $dir.value = option;
        $dir.filter.q = option.raw[$dir.as];

        $dir.ngModelCtrl.$setViewValue($dir.prop ? option.raw[$dir.prop] : option.raw);
        $dir.searchUpdate();
        $dir.showOptions = false;
    };

    $dir.onClickOutside = () => {
        $timeout(() => {
            $dir.showOptions = false;
        }, 0);
    };

    $dir.onInputClick = () => {
        if ($dir.autoClearEnabled) {
            $dir.filter.q = "";
        }

        $dir.searchInputChanged();
    }

    $dir.findValue = (ngModel) => {
        return $dir.optionsPrepared.find((option) => {
            if ($dir.strict) {
                return $dir.prop ? option.raw[$dir.prop] === ngModel : option.raw == ngModel;
            }

            return $dir.prop ? option.raw[$dir.prop] == ngModel : option.raw == ngModel;
        }) || null
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

            $dir.optionsPrepared = options.map((option) => {
                return { _name: option[$dir.as].toString().toLowerCase(), raw: option };
            });

            $dir.buildSearchedOptions();
            $dir.value = $dir.findValue($dir.ngModel);
        });

        $scope.$watch('$dir.ngModel', (ngModel, modalOld) => {
            if (ngModel == modalOld) {
                return;
            }
    
            if (Array.isArray($dir.optionsPrepared) && (ngModel != undefined)) {
                $dir.value = $dir.findValue(ngModel);
            }
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
            id: "@",
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
        template: ($el, $attr) => {
            const templateName = $attr.template || 'select-control';

            return $el ? {
                'select-control': require('./templates/select-control.pug')(),
                'select-control-voucher': require('./templates/select-control-voucher.pug')(),
                'select-control-country-codes': require('./templates/select-control-country-codes.pug')(),
            }[templateName] || `<div>Template: ${templateName} not found</div>` : '<div></div>';
        }
    };
};