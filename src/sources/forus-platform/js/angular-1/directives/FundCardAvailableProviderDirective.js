let FundCardAvailableProviderDirective = function(
    $scope, 
    $state, 
    FundService, 
    ProviderFundService
) {
    $scope.fundCategories = $scope.fund.product_categories.map((val) => {
        return val.name;
    });

    $scope.providerApplyFund = function(fund) {
        ProviderFundService.applyForFund(
            $scope.organization.id, 
            $scope.fund.id
        ).then(function(res) {
            $state.reload();
        });
    };
};

module.exports = () => {
    return {
        scope: {
            organization: '=',
            fund: '='
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            'FundService',
            'ProviderFundService',
            FundCardAvailableProviderDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-card-available-provider.html' 
    };
};