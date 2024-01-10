const FundItemPreCheckDirective = function ($scope, $state, FundService) {
    const $dir = $scope.$dir;

    const getProgressStatusTitle = () => {
        if ($dir.fund.criteria_valid_percentage < 33) return 'Lage kans';
        if ($dir.fund.criteria_valid_percentage < 66) return 'Gemiddelde kans';

        return 'Goede kans';
    }

    $dir.applyFund = function ($e, fund) {
        $e.preventDefault();

        if ($dir.fund.taken_by_partner) {
            return FundService.showTakenByPartnerModal();
        }

        $state.go('fund-activate', { fund_id: fund.id });
    };

    $dir.$onInit = () => {
        const criteria = $dir.fund.criteria;

        $dir.showMore = false;
        $dir.showMoreRequestInfo = false;
        $dir.progressStatusTitle = getProgressStatusTitle();

        $dir.criteriaValid = criteria.filter((criteria) => criteria.is_valid).length;
        $dir.criteriaValidPercentage = Math.round($dir.criteriaValid / criteria.length * 100);
    };
};

module.exports = () => {
    return {
        scope: {
            fund: '=',
            amounts: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            'FundService',
            FundItemPreCheckDirective,
        ],
        templateUrl: 'assets/tpl/directives/lists/funds/fund-item-pre-check.html',
    };
};
