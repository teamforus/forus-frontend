let MultiSelectDirective = function($scope, $filter) {

    if (!$scope.options) {
        $scope.options = [];
    }

    if (!$scope.labelText) {
        $scope.labelText = $filter('translate')('multi_select.title');
    }

    let buildOptions = function() {
        $scope.optionsById = {};
        $scope.selectorOptions = [{
            id: 0,
            name: $scope.optionSelectText || 'Selecteer categorie'
        }];
        $scope.selectedOption = 0;

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

    $scope.$watch('selectedOption', function(current, old, scope) {
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
            ngModel: '=',
            options: '=',
            labelText: '@',
            optionSelectText: '@',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$filter',
            MultiSelectDirective
        ],
        templateUrl: 'assets/tpl/directives/multi-select.html' 
    };
};