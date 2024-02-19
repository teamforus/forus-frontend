const FundItemPreCheckDirective = function ($scope, $state, FundService) {
    const $dir = $scope.$dir;

    const getProgressStatusTitle = () => {
        if ($dir.criteriaValidPercentage < 33) return 'Lage kans';
        if ($dir.criteriaValidPercentage < 66) return 'Gemiddelde kans';

        return 'Goede kans';
    }

    const getCriteriaValidPercentage = (criteria) => {
        if (criteria.find((criterion) => !criterion.is_valid && criterion.is_knockout)) {
            return 0;
        }

        // Amount of criteria with null impact level
        let criteriaWithoutImpact = criteria.filter((criterion) => !criterion.impact_level).length;
        // Max impact level of all criterias
        let maxImpactLevel = criteria.reduce((total, criterion) => {
            return total += criterion.impact_level > 0 ? criterion.impact_level : 0;
        }, 0);

        let validCriteria = criteria.filter(criterion => criterion.is_valid);
        let validPercentage = Math.round(validCriteria.reduce((validPercentage, criterion) => {
            if (!criterion.impact_level) {
                return validPercentage + (100 - maxImpactLevel) / criteriaWithoutImpact;
            }

            return validPercentage + criterion.impact_level;
        }, 0));
        
        return validPercentage < 0 ? 0 : (validPercentage > 100 ? 100 : validPercentage);
    };

    const mapRecords = (criteria) => {
        return criteria.map(criterion => {
            let recordSetting = criterion.record_settings.find(record_setting => (record_setting.fund_id == $dir.fund.id));

            return {
                ...criterion,
                is_knockout: recordSetting?.is_knock_out ? true : false,
                impact_level: recordSetting?.impact_level,
                knockout_description: recordSetting?.description,
            };
        });
    };

    $dir.applyFund = function ($e, fund) {
        $e.preventDefault();

        if ($dir.fund.taken_by_partner) {
            return FundService.showTakenByPartnerModal();
        }

        $state.go('fund-activate', { fund_id: fund.id });
    };

    $dir.$onInit = () => {
        $dir.fund.criteria = mapRecords($dir.fund.criteria);

        $dir.showMore = false;
        $dir.showMoreRequestInfo = false;
        $dir.positiveAmount = parseFloat($dir.fund.amount_for_identity) > 0;

        $dir.criteriaValidPercentage = getCriteriaValidPercentage($dir.fund.criteria);
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
