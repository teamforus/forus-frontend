let PopupOfficesDirective = function(
    $state,
    $scope,
    OfficeService,
    ProductCategoryService
) {
    $scope.selectedOffice = false;
    $scope.productCategories || [];
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
                });
            } else {
                $scope.shownOffices = $scope.offices;
            }
        }
    });

    $scope.weekDays = OfficeService.scheduleWeekDays();

    $scope.selectCategory = (category) => {
        if ($scope.selectedCategoryId != category.id) {
            $scope.selectedCategoryId = category.id;
        } else {
            $scope.selectedCategoryId = false;
        }

        if ($scope.selectedCategoryId) {
            $scope.shownOffices = $scope.offices.filter(office => {
                return office.organization.product_categories.filter(function(category) {
                    return category.id == $scope.selectedCategoryId;
                }).length > 0
            });
        } else {
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