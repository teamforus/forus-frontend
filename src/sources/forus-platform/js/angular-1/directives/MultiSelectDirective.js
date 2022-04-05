const uniqueId = require('lodash/uniqueId');

const MultiSelectDirective = function($scope) {
    if (!$scope.options) {
        $scope.options = [];
    }

    if (!$scope.id) {
        $scope.id = 'multiselect_' + uniqueId();
    }

    const buildOptions = function() {
        $scope.optionsById = {};
        $scope.selectedOption = 0;
        $scope.selectorOptions = [{
            id: 0,
            name: $scope.optionSelectText || 'Selecteer categorie',
        }];

        $scope.options.forEach(element => {
            $scope.optionsById[element.id] = element.name;

            if ($scope.ngModel.indexOf(element.id) == -1) {
                $scope.selectorOptions.push({
                    id: element.id,
                    name: element.name
                });
            }
        });
    }

    $scope.$watch('selectedOption', function(current) {
        if (current != 0) {
            $scope.ngModel.push(current);
            $scope.selectedOption = 0;
            buildOptions();
        }
    });

    $scope.removeItem = function(id) {
        $scope.ngModel.splice($scope.ngModel.indexOf(id), 1);
        buildOptions();
    };

    buildOptions();
};

module.exports = () => {
    return {
        scope: {
            id: '@',
            label: '@',
            ngModel: '=',
            options: '=',
            optionSelectText: '@',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            MultiSelectDirective
        ],
        templateUrl: 'assets/tpl/directives/multi-select.html' 
    };
};