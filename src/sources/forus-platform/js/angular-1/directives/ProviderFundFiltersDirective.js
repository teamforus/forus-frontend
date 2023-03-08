let ProviderFundFiltersDirective = function($scope, $filter) {
    let $translate  = $filter('translate');

    $scope.getFundFilters = () => {
        if (!$scope.fundsAvailable || !$scope.fundsAvailable.meta) {
            return;
        }

        $scope.fundLabels = $scope.fundsAvailable.meta.tags.slice();
        $scope.fundOrganizations = $scope.fundsAvailable.meta.organizations.slice();

        $scope.fundLabels.unshift({
            key: 'null',
            name: $translate('sign_up_provider.filters.options.all_labels')
        });

        $scope.fundOrganizations.unshift({
            id: 'null',
            name: $translate('sign_up_provider.filters.options.all_organizations')
        });

        $scope.fundLabel = $scope.fundLabel ? $scope.fundLabel : 'null';
        $scope.fundOrganization = $scope.fundOrganization ? $scope.fundOrganization : 'null';
    }

    $scope.filterFunds = () => {
        $scope.filters.tag = $scope.fundLabel !== 'null' ? $scope.fundLabel : null;
        $scope.filters.organization_id = $scope.fundOrganization !== 'null' ? $scope.fundOrganization : null;
    }

    this.$onInit = function() {
        $scope.$watch('fundsAvailable', function(value) {
            $scope.getFundFilters();
        });

        $scope.$watch('filters', (newVal) => {
            $scope.fundLabel = newVal.tag ? newVal.tag : 'null';
            $scope.fundOrganization = newVal.organization_id ? newVal.organization_id : 'null';
        }, true);
    }
};

module.exports = () => {
    return {
        scope: {
            fundsAvailable: '=',
            organization: '=',
            filters: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$filter',
            ProviderFundFiltersDirective
        ],
        templateUrl: 'assets/tpl/directives/provider-fund-filters.html' 
    };
};