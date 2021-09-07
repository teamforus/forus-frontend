let BlockProviderOrganizationEmployeesDirective = function($scope) {
    $scope.$dir = { employees: $scope.employees };
};

module.exports = () => {
    return {
        scope: {
            employees: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            BlockProviderOrganizationEmployeesDirective
        ],
        templateUrl: 'assets/tpl/directives/blocks/sponsor/block-provider-organization-employees.html'
    };
};