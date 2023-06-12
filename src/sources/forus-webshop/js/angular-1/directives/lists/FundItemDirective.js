const FundItemDirective = function($state, $scope, appConfigs, FundService, ConfigService, PushNotificationsService) {
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

    ConfigService.get('webshop').then((res) => {
        appConfigs.features = res.data;
        
        $dir.fund = FundService.mapFund($scope.fund, $scope.vouchers, appConfigs.features);
        $dir.media = $dir.fund.logo || $dir.fund.organization.logo || null;
    });

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
            'appConfigs',
            'FundService',
            'ConfigService',
            'PushNotificationsService',
            FundItemDirective
        ],
        templateUrl: ($el, $attr) => {
            return 'assets/tpl/directives/lists/funds/' + ($attr.template || 'fund-item-list') + '.html'
        }
    };
};
