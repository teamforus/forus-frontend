const FundItemDirective = function($scope, FundService) {
    const $dir = $scope.$dir = {};

    $dir.applyFund = function(fund) {
        if ($dir.applyingFund) {
            return;
        }

        if (fund.taken_by_partner) {
            return FundService.showTakenByPartnerModal();
        }

        $dir.applyingFund = true;

        FundService.apply(fund.id).then((res) => {
            return $state.go('voucher', res.data.data);
        }).finally(() => $dir.applyingFund = false);
    };

    $dir.addFundMeta = (fund, vouchers) => {
        fund.vouchers        = vouchers.filter(voucher => voucher.fund_id == fund.id && !voucher.expired);
        fund.isApplicable    = fund.criteria.filter(criterion => !criterion.is_valid).length == 0;
        fund.alreadyReceived = fund.vouchers.length !== 0;

        fund.canApply    = !fund.alreadyReceived && fund.isApplicable && !fund.has_pending_fund_requests;
        fund.canActivate = !fund.alreadyReceived && fund.has_approved_fund_requests;
        fund.isPending   = !fund.alreadyReceived && fund.has_pending_fund_requests;

        return fund;
    };

    $dir.fund = $dir.addFundMeta($scope.fund, $scope.vouchers);
    $dir.media = $dir.fund.logo || $dir.fund.organization.logo || null;
    $dir.applyingFund = false;
};

module.exports = () => {
    return {
        scope: {
            fund: '=',
            vouchers: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'FundService',
            FundItemDirective
        ],
        templateUrl: ($el, $attr) => {
            return 'assets/tpl/directives/lists/funds/' + ($attr.template || 'fund-item-list') + '.html'
        }
    };
};
