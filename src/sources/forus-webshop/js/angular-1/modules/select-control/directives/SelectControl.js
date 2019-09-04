let SelectControl = function($scope, $timeout) {
    let $dir = {};
    let $optionsMap = [];

    $scope.$dir = $dir;

    $dir.filter = {
        name: "",
    };

    $dir.showOptions = false;
    $dir.options = [];

    if (!$scope.options) {
        $scope.options = [];
    }

    $scope.buildSearchedOptions = () => {
        let search = $dir.filter.name.toLowerCase();
        let search_len = search.length;
        let options = $optionsMap.map((option) => {
            option._index = option._name.indexOf(search);
            return option;
        }).filter(option => option._index > -1);

        options.sort((a, b) => a._index - b._index);

        $dir.options = options.map(option => {
            let end = -(option.name.length - (option._index + search_len));
            let nameFormat = [
                option.name.slice(0, option._index),
                option.name.slice(option._index, option._index + search_len),
                end < 0 ? option.name.slice(end) : "",
            ];
            option.nameFormat = nameFormat;
            
            return option;
        });
    };

    $dir.updateOptions = () => {

    };

    $dir.searchOption = () => {
        $dir.showOptions = true;

        if ($scope.ngModel && $scope.ngModel.name) {
            $dir.filter.name = $scope.ngModel.name;
        }

        $scope.buildSearchedOptions();
    };

    $dir.searchInputChanged = () => {
        $scope.buildSearchedOptions();
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
        $scope.ngModel = value;

        if (typeof $scope.ngChange == 'function') {
            $scope.ngChange({
                value: $scope.ngModel
            });
        }
    };

    $scope.init = () => {
        $scope.optionsPreloadSize = $scope.optionsPreloadSize || 50;
        $optionsMap = JSON.parse(JSON.stringify($scope.options));
        $optionsMap = $optionsMap.map(option => {
            option._name = option.name.toLowerCase();
            return option;
        });

        $scope.buildSearchedOptions();

        $dir.controlId = 'select_control_';
        $dir.controlId += Date.now() + '_' + Math.random().toString().slice(2);
    }

    $scope.init();
};

module.exports = () => {
    return {
        scope: {
            placeholder: "@",
            multiple: "=",
            search: "=",
            options: "=",
            ngModel: '=',
            ngChange: '&',
            optionsPreloadSize: "@"
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$timeout',
            SelectControl
        ],
        template: require('./templates/select-control.pug'),
        //templateUrl: 'assets/tpl/modules/select-control/select-control.html'
    };
};