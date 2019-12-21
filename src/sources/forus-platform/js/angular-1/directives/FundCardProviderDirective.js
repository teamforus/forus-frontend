let FundCardProviderDirective = function(
    $scope,
) {
    $scope.fund = $scope.providerFund.fund;
    $scope.fundCategories = $scope.fund.product_categories.map((val) => {
        return val.name;
    });
};

module.exports = () => {
    return {
        scope: {
            organization: '=',
            providerFund: '=',
            type: '@'
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            FundCardProviderDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-card-provider.html' 
    };
};