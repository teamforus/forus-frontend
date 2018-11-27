let PopupOfficesDirective = function(
    $state,
    $scope,
    OfficeService,
    ProductCategoryService
) {
    $scope.selectedOffice = false;
    $scope.productCategories || [];

    $scope.selectedCategories = [];

    $scope.$watch('popup.show', function(show) {
        if (show) {
            if (!$scope.productCategories) {
                ProductCategoryService.list().then(res => {
                    $scope.productCategories = res.data.data;

                });
            }

            if (!$scope.offices) {
                OfficeService.list().then(res => {
                    $scope.offices = res.data.data;
                    $scope.shownOffices = $scope.offices;
                    $scope.providersCount = getCountOfProviders($scope.offices);
                });
            } else {
                $scope.shownOffices = $scope.offices;
                $scope.providersCount = getCountOfProviders($scope.offices);
            }
        }
    });

    let getCountOfProviders = function(offices) {
        let count = 0,
            groupedOffices = [];

        offices.forEach(function (value, i) {
            if(!groupedOffices[value['organization_id']]){
                groupedOffices[value['organization_id']] = 1;
                count++;
            }
        });

        return count;
    };

    $scope.weekDays = OfficeService.scheduleWeekDays();

    $scope.selectCategory = (category) => {

        if($scope.selectedCategories.indexOf(category.id) !== -1) {
            $scope.shownOffices = $scope.offices;
            $scope.selectedCategories.splice($scope.selectedCategories.indexOf(category.id), 1);
        }else{
            $scope.selectedCategories.push(category.id);
        }

        if($scope.selectedCategories.length) {
            $scope.shownOffices = $scope.offices.filter(office => {
                return office.organization.product_categories.filter(function (category) {
                    return $scope.selectedCategories.filter(function (selectedCategory) {
                        return category.id == selectedCategory;
                    }).length > 0;
                }).length > 0
            });
        }else{
            $scope.shownOffices = $scope.offices;
        }

        $scope.selectOffice(false);
    };

    $scope.selectOffice = (office) => {
        $scope.selectedOffice = office ? office.id : office;
    };
};

module.exports = () => {
    return {
        scope: {
            popup: '=',
            productCategories: '=?'
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$state',
            '$scope',
            'OfficeService',
            'ProductCategoryService',
            PopupOfficesDirective
        ],
        templateUrl: 'assets/tpl/directives/popup-offices.html'
    };
};