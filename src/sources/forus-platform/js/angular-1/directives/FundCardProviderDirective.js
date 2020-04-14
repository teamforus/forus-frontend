let FundCardProviderDirective = function(
    $scope,
    ModalService,
    ProductService
) {
    $scope.fund = $scope.providerFund.fund;

    $scope.shownProductType = $scope.providerFund.allow_some_products && 
        !$scope.providerFund.allow_products ?
        'allow_some_products' : 'allow_products';
    
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