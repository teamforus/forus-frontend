let MapPointerProvidersOfficeDirective = function($scope) {
    $scope.office = $scope.pointer;

    if ($scope.office.photo) {
        $scope.imageUrl = $scope.office.photo.sizes.thumbnail;
    } else if ($scope.office.organization.logo) {
        $scope.imageUrl = $scope.office.organization.logo.sizes.thumbnail;
    } else {
        $scope.imageUrl = 'assets/img/placeholders/office-thumbnail.png';
    }

    $scope.officeStateParams = {
        provider_id: $scope.office.organization_id,
        office_id: $scope.office.id,
    };
};

module.exports = () => {
    return {
        scope: {
            pointer: '=',
        },
        restrict: "EA",
        replace: false,
        controller: [
            '$scope',
            MapPointerProvidersOfficeDirective
        ],
        templateUrl: 'assets/tpl/directives/map-pointers/map-pointer-providers-office.html'
    };
};