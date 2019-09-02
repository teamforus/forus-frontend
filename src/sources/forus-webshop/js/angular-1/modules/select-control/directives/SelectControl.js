let SelectControl = function($scope, $timeout) {
    let $dir = {};

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
        $dir.options = $scope.options.filter(
            option => option.name.includes($dir.filter.name)
        );
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
        $scope.buildSearchedOptions();

        $dir.controlId = 'select_control_';
        $dir.controlId +=  Date.now() + '_' + Math.random().toString().slice(2);
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