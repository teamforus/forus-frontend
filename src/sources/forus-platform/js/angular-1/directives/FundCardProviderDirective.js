let FundCardProviderDirective = function(
    $scope,
    ModalService,
    ProductService
) {
    $scope.fund = $scope.providerFund.fund;
    $scope.fundCategories = $scope.fund.product_categories.map((val) => {
        return val.name;
    });
    
    $scope.viewOffers = () => {
        ProductService.list($scope.organization.id).then(res => {
            ModalService.open('fundOffers', {
                fund: $scope.fund,
                providerFund: $scope.providerFund,
                organization: $scope.organization,
                offers: res.data,
            });
        }, console.error);
    };
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
            'ModalService',
            'ProductService',
            FundCardProviderDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-card-provider.html' 
    };
};