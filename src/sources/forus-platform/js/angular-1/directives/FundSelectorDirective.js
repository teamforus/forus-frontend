let FundSelectorDirective = function(
    $scope, 
    $rootScope, 
    $element, 
    FundService
) {
    $scope.getLastActiveFund = () => {
        let fundId = localStorage.getItem('last_selected_fund_id');

        FundService.read(
            $rootScope.activeOrganization.id, 
            fundId ? fundId : $scope.funds[0].id
        ).then(res => {
            $scope.activeFund = res.data.data;
            $scope.onFundSelect($scope.activeFund);
        });
    }

    $scope.selectFund = fund => {
        localStorage.setItem('last_selected_fund_id', fund.id);
        $scope.onFundSelect(fund);
        $scope.activeFund = fund;
    };

    $scope.getLastActiveFund();
};

module.exports = () => {
    return {
        scope: {
            'funds': '=',
            'onFundSelect': '<',
        },
        restrict: "E",
        controller: [
            '$scope',
            '$rootScope',
            '$element',
            'FundService',
            FundSelectorDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-selector.html'
    };
};