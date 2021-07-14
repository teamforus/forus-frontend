let ProviderFundFiltersDirective = function(
    $scope,
    $stateParams,
    $filter,
    ProviderFundService
) {
    let $translate  = $filter('translate');
    $scope.allFunds = $scope.fundsAvailable;

    $scope.getFundFilters = () => {
        if (!$scope.fundsAvailable || !$scope.fundsAvailable.data) {
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

    $scope.filterFunds = (organization = $scope.organization) => {
        let search_params = { 
            per_page: $scope.fundsAvailable.meta.per_page 
        };

        if ($scope.fundOrganization && $scope.fundOrganization != 'null') {
            search_params.organization_id = $scope.fundOrganization;
        }

        if ($scope.fundLabel && $scope.fundLabel != 'null') {
            search_params.tag = $scope.fundLabel;
        }

        if ($stateParams.fund_id) {
            search_params.fund_id = $stateParams.fund_id;
        }

        if (!Object.keys(search_params).length) {
            $scope.fundsAvailable = $scope.allFunds;
        }

        return ProviderFundService.listAvailableFunds(organization.id, search_params).then(res => {
            $scope.fundsAvailable = {
                meta: res.data.meta,
                data: res.data.data
            };
        });
    }

    this.$onInit = function() {
        $scope.$watch('fundsAvailable', function(value) {
            if (!$scope.fundOrganizations || !$scope.fundOrganizations.length) {
                $scope.getFundFilters();
            }
        });
    }
};

module.exports = () => {
    return {
        scope: {
            fundsAvailable: '=',
            organization: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$stateParams',
            '$filter',
            'ProviderFundService',
            ProviderFundFiltersDirective
        ],
        templateUrl: 'assets/tpl/directives/provider-fund-filters.html' 
    };
};