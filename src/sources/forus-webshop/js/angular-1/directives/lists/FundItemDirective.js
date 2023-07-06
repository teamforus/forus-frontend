const FundItemDirective = function($state, $scope, FundService, PushNotificationsService) {
    const $dir = $scope.$dir = {};
    
    $dir.setShowMore = (e, showMore = false) => {
        e?.preventDefault();
        e?.stopPropagation();
        
        $dir.showMore = showMore;
    };

    $dir.applyFund = function($event, fund) {
        $event.stopPropagation();
        $event.preventDefault();

        if ($dir.applyingFund) {
            return;
        }

        if (fund.taken_by_partner) {
            return FundService.showTakenByPartnerModal();
        }

        $dir.applyingFund = true;

        FundService.apply(fund.id).then((res) => {
            PushNotificationsService.success('Tegoed geactiveerd.');
            if ($scope.funds.data.filter(fund => {
               return fund.isApplicable && !fund.alreadyReceived
            }).length === 0) {       
                return $state.go('voucher', res.data.data);
            } else {
                $state.reload()
            }
        }, res => {
            PushNotificationsService.danger(res.data.message);
        }).finally(() => { 
            $dir.applyingFund = false 
        });
    };

    $dir.addFundMeta = (fund, vouchers) => {
        fund.vouchers        = vouchers.filter(voucher => voucher.fund_id == fund.id && !voucher.expired);
        fund.isApplicable    = fund.criteria.filter(criterion => !criterion.is_valid).length == 0;
        fund.alreadyReceived = fund.vouchers.length !== 0;

        fund.canApply    = !fund.is_external && !fund.alreadyReceived && fund.isApplicable && !fund.has_pending_fund_requests;
        fund.canActivate = !fund.is_external && !fund.alreadyReceived && (fund.has_approved_fund_requests || fund.isApplicable);
        fund.isPending   = !fund.alreadyReceived && fund.has_pending_fund_requests;

        fund.showActivateButton = !fund.alreadyReceived && fund.isApplicable;
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
            funds: '=',
            vouchers: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$state',
            '$scope',
            'FundService',
            'PushNotificationsService',
            FundItemDirective
        ],
        templateUrl: ($el, $attr) => {
            return 'assets/tpl/directives/lists/funds/' + ($attr.template || 'fund-item-list') + '.html'
        }
    };
};
