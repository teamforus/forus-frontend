let ProviderFundFiltersDirective = function(
    $scope,
    $stateParams,
    $filter,
    ProviderFundService
) {
    let $translate  = $filter('translate');
    $scope.allFunds = $scope.fundsAvailable;

    $scope.getFundFilters = () => {
        $scope.fundOrganizations = [];
        $scope.fundLabels = [];

        let processedOrganizations = [];
        let processedLabels = [];

        if (!$scope.fundsAvailable || !$scope.fundsAvailable.data) {
            return;
        }

        $scope.fundsAvailable.data.forEach(fund => {
            if (processedOrganizations.indexOf(fund.organization.id) == -1) {
                $scope.fundOrganizations.push({
                    id: fund.organization.id,
                    name: fund.organization.name
                });

                processedOrganizations.push(fund.organization.id);
            }

            fund.tags.forEach(tag => {
                if (processedLabels.indexOf(tag.id) == -1) {
                    $scope.fundLabels.push({
                        id: tag.id,
                        key: tag.key,
                        name: tag.name
                    });

                    processedLabels.push(tag.id);
                }
            });
        });

        $scope.fundOrganizations = $scope.fundOrganizations.map(fundOrganization => {
            fundOrganization.id_str = fundOrganization.id += '';
            return fundOrganization;
        });

        $scope.fundLabels.unshift({
            key: 'null',
            name: $translate('sign_up_provider.filters.options.all_labels')
        });

        $scope.fundOrganizations.unshift({
            id_str: 'null',
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

        return ProviderFundService.listAvailableFunds(
            organization.id, search_params
        ).then(res => {
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