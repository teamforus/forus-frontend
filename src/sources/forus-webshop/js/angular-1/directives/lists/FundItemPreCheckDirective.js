const FundItemPreCheckDirective = function ($scope, $state, FundService) {
    const $dir = $scope.$dir;

    const getProgressStatusTitle = () => {
        if ($dir.criteriaValidPercentage < 33) return 'Lage kans';
        if ($dir.criteriaValidPercentage < 66) return 'Gemiddelde kans';

        return 'Goede kans';
    }

    const getCriteriaValidPercentage = (criteria) => {
        if (criteria.find((criterion) => !criterion.is_valid && criterion.is_knock_out)) {
            return 0;
        }

        const totalImpactPoints = criteria
            .reduce((total, criterion) => total += criterion.impact_level, 0);

        const validImpactPoints = criteria
            .filter(criterion => criterion.is_valid)
            .reduce((total, criterion) => total += criterion.impact_level, 0);

        const validPercentage = Math.round((validImpactPoints / totalImpactPoints) * 100);

        return validPercentage < 0 ? 0 : (validPercentage > 100 ? 100 : validPercentage);
    };

    $dir.applyFund = function ($e, fund) {
        $e.preventDefault();

        if ($dir.fund.taken_by_partner) {
            return FundService.showTakenByPartnerModal();
        }

        $state.go('fund-activate', { fund_id: fund.id });
    };

    $dir.$onInit = () => {
        $dir.showMore = false;
        $dir.showMoreRequestInfo = false;
        $dir.positiveAmount = parseFloat($dir.fund.amount_for_identity) > 0;

        $dir.criteriaValidPercentage = Math.max(5, getCriteriaValidPercentage($dir.fund.criteria));
        $dir.progressStatusTitle = getProgressStatusTitle();
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
