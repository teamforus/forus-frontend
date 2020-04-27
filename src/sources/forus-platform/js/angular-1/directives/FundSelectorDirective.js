let FundSelectorDirective = function (
    $scope
) {
    let storageKey = 'selected_fund_id';
    let fundId = localStorage.getItem(storageKey);

    $scope.getLastActiveFund = () => {
        $scope.selectFund($scope.funds.filter(
            fund => fund.id == fundId
        )[0] || $scope.funds[0] || null);
    };

    $scope.selectFund = fund => {
        localStorage.setItem(storageKey, fund ? fund.id : null);
        $scope.activeFund = fund;

        if (fund) {
            $scope.onFundSelect(fund);
        }
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
            FundSelectorDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-selector.html'
    };
};