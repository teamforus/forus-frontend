let BlockProviderOrganizationOfficesDirective = function($scope) {
    $scope.$dir = { offices: $scope.offices };
};

module.exports = () => {
    return {
        scope: {
            offices: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            BlockProviderOrganizationOfficesDirective
        ],
        templateUrl: 'assets/tpl/directives/blocks/sponsor/block-provider-organization-offices.html'
    };
};