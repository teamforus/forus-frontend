const uniqueId = require('lodash/uniqueId');

const SelectControlDirective = function($scope, $timeout) {
    const $dir = $scope.$dir;

    $dir.filter = {
        name: "",
    };

    $dir.buildSearchedOptions = () => {
        const search = $dir.filter.name.toLowerCase();
        const search_len = search.length;

        const options = $dir.optionsPrepared.map((option) => {
            return { ...option, _index: option._name.indexOf(search) };
        }).filter((option) => option._index > -1);

        if (search) {
            options.sort((a, b) => a._index - b._index);
        }

        $dir.optionsFiltered = options.map(option => {
            const end = -(option.name.length - (option._index + search_len));
            const nameFormat = [
                option.name.slice(0, option._index),
                option.name.slice(option._index, option._index + search_len),
                end < 0 ? option.name.slice(end) : "",
            ];

            return { ...option, nameFormat };
        });
    };

    $dir.searchOption = () => {
        $dir.showOptions = true;

        if ($dir.strict && $dir.value && $dir.value.name) {
            $dir.filter.name = $dir.value.name;
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
                value: $dir.filter.name
            });
        }
    };

    $dir.searchInputChanged = () => {
        $dir.buildSearchedOptions();
    };

    $dir.selectOption = (option) => {
        $dir.setModel(option);
        $dir.showOptions = false;
    };

    $dir.onClickOutside = () => {
        $timeout(() => {
            $dir.showOptions = false;
        }, 0);
    };

    $dir.setModel = (value) => {
        $dir.value = value;
        $dir.filter.name = value.name;

        $dir.ngModelCtrl.$setViewValue($dir.prop ? value[$dir.prop] : value);
        $dir.searchUpdate();
    };

    $dir.onInputClick = () => {
        $dir.filter.name = "";
        $dir.searchInputChanged();
    }

    $dir.findValue = (ngModel) => {
        return $dir.options.filter((option) => {
            if ($dir.strict) {
                return $dir.prop ? option[$dir.prop] === ngModel : option === ngModel;
            }

            return $dir.prop ? option[$dir.prop] == ngModel : option == ngModel;
        })[0] || null
    }

    $dir.$onInit = () => {
        $dir.as = typeof $dir.as === 'undefined' ? 'name' : $dir.as;
        $dir.prop = typeof $dir.prop === 'undefined' ? null : $dir.prop;
        $dir.mode = typeof $dir.mode === 'undefined' ? 'strict' : $dir.mode;

        $dir.strict = $dir.mode === 'strict';
        $dir.controlId = 'select_control_' + uniqueId();
        $dir.showOptions = false;
        $dir.optionsPreloadSize = $dir.optionsPreloadSize || 50;
        $dir.optionsPrepared = [];
        $dir.optionsFiltered = [];

        $dir.value = $dir.findValue($dir.ngModel);

        $scope.$watch('$dir.options', (options) => {
            if (!Array.isArray(options)) {
                return;
            }

            $dir.optionsPrepared = JSON.parse(JSON.stringify(options)).map((option) => {
                return { ...option, _name: option[$dir.as].toString().toLowerCase() };
            });

            $dir.buildSearchedOptions();
        });

        if (typeof $dir.ngChangeQuery == 'function') {
            $scope.$watch('$scope.$dir.filter.name', (value, prev) => {
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
            autoclear: "=",
            ngModel: '=',
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