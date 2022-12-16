const FundSelectorDirective = function (
    $scope,
    FundService,
) {
    const $dir = $scope.$dir;

    $dir.selectFund = (fund) => {
        FundService.setLastSelectedFund(fund)
        $dir.activeFund = fund;

        if (fund) {
            $dir.onFundSelect(fund);
        }
    };

    $dir.$onInit = () => {
        const fund = FundService.getLastSelectedFund($dir.funds);

        if ($dir.fund?.id !== fund?.id) {
            return $dir.selectFund(fund);
        }

        $dir.activeFund = fund;
    };
};

module.exports = () => {
    return {
        scope: {
            'fund': '=',
            'funds': '=',
            'onFundSelect': '<',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "E",
        controller: [
            '$scope',
            'FundService',
            FundSelectorDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-selector.html'
    };
};