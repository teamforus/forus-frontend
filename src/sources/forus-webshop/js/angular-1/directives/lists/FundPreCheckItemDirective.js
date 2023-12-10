const FundPreCheckItemDirective = function(
    $scope,
    $state,
    FundService,
) {
    const $dir = $scope.$dir = {};

    $dir.fund = $scope.fund;

    const getProgressStatusTitle = () => {
        if ($dir.fund.criteria_valid_percentage < 33) {
            return 'Lage kans';
        }

        if ($dir.fund.criteria_valid_percentage < 66) {
            return 'Gemiddelde kans';
        }

        return 'Goede kans';
    }

    $dir.showMoreRequestInfo = false;
    
    $dir.setShowMore = (e, showMore = false) => {
        e?.preventDefault();
        e?.stopPropagation();
        
        $dir.showMore = showMore;
    };
    
    $dir.setShowMoreRequestInfo = (e, showMoreRequestInfo = false) => {
        e?.preventDefault();
        e?.stopPropagation();
        
        $dir.showMoreRequestInfo = showMoreRequestInfo;
    };

    $dir.progressStatusTitle = getProgressStatusTitle();

    $dir.applyFund = function ($e, fund) {
        $e.preventDefault();

        if ($dir.fund.taken_by_partner) {
            return FundService.showTakenByPartnerModal();
        }

        $state.go('fund-activate', { fund_id: fund.id });
    };
};

module.exports = () => {
    return {
        scope: {
            fund: '=',
            amounts: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            'FundService',
            FundPreCheckItemDirective,
        ],
        templateUrl: ($el, $attr) => {
            return 'assets/tpl/directives/lists/funds/fund-item-pre-check.html'
        }
    };
};
