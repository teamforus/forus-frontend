const FundItemDirective = function(
    $state, 
    $scope, 
    $rootScope, 
    FundService, 
    PushNotificationsService,
) {
    const $dir = $scope.$dir = {};
    
    $dir.applyingFund = false;
    
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

    $dir.goToFundRequests = function($event) {
        $event.stopPropagation();
        $event.preventDefault();

        $state.go('fund-requests', {
            fund_id: $dir.fund.id
        });
    };

    $dir.unwatch = $rootScope.$watch('appConfigs.features', (features) => {
        if (!features) {
            return;
        }

        $dir.unwatch();
        $dir.fund = FundService.mapFund($scope.fund, $scope.vouchers, features);
        $dir.media = $dir.fund.logo || $dir.fund.organization.logo || null;
    });
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
            '$rootScope',
            'FundService',
            'PushNotificationsService',
            FundItemDirective,
        ],
        templateUrl: ($el, $attr) => {
            return 'assets/tpl/directives/lists/funds/' + ($attr.template || 'fund-item-list') + '.html'
        }
    };
};
