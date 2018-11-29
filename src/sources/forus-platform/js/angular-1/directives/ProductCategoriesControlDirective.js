let ProductCategoriesControlDirective = function($scope) {
    if (!Array.isArray($scope.options)) {
        $scope.options = [];
    }

    if (!Array.isArray($scope.ngModel)) {
        $scope.ngModel = [];
    }

    $scope.filterOptions = (id, values) => {
        if ($scope.selectedType == id) {
            return;
        }

        $scope.selectedType = id;
        $scope.filteredOptions = $scope.options.filter(
            option => option.service == id
        );

        // $scope.ngModel = values ? values : [];
    }

    $scope.hideProduct = $scope.hideProduct ? $scope.hideProduct : false;

    if($scope.hideProduct) {
        $scope.types = {
            '1': "product_category_type.services"
        }
    }else{
        $scope.types = {
            '0': "product_category_type.products",
            '1': "product_category_type.services",
        }
    }

    $scope.types = _.filter($scope.types, function(type, id) {
        return $scope.options.filter(
            option => option.service == id
        ).length > 0;
    });

    $scope.ngModel = $scope.ngModel.filter(id => !isNaN(parseInt(id)));

    $scope.isChecked = (id) => $scope.ngModel.indexOf(id) != -1;
    $scope.toggleOption = (id) => {
        if ($scope.isChecked(id)) {
            $scope.ngModel = $scope.ngModel.filter(option => option != id);
        } else {
            $scope.ngModel.push(id);
        }
    };


    /* if ($scope.ngModel.length > 0) {
        let activeOptions = $scope.options.filter(
            (option) => {
                return option.id == $scope.ngModel[0];
            }
        );

        if (activeOptions.length > 0) {
            return $scope.filterOptions(
                activeOptions[0].service + '',
                $scope.ngModel
            );
        }
    } */

    if($scope.hideProduct) {
        $scope.filterOptions('1');
    }else{
        $scope.filterOptions('0');
    }
};

module.exports = () => {
    return {
        scope: {
            ngModel: '=',
            options: '=',
            hideProduct: '<'
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            ProductCategoriesControlDirective
        ],
        templateUrl: 'assets/tpl/directives/product-categories-control.html'
    };
};