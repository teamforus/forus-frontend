let FundCardProviderCanJoinDirective = function(
    $scope, 
    ProviderFundService,
    ModalService
) {
    $scope.providerApplyFund = function(fund) {
        ProviderFundService.applyForFund(
            $scope.organization.id, 
            $scope.fund.id
        ).then(function(res) {
            if (!$scope.hideModal) {
                ModalService.open('modalNotification', {
                    type: 'info',
                    title: 'provider_funds_available.applied_for_fund.title',
                    description: 'provider_funds_available.applied_for_fund.description',
                    icon: 'fund_applied',
                    closeBtnText: 'modal.buttons.confirm',
                }, {
                    onClose: () => {
                        $scope.fund.applied = true;
                        $scope.onApply();
                    }
                });
            } else {
                $scope.fund.applied = true;
                $scope.onApply();
            }
        });
    };
};

module.exports = () => {
    return {
        scope: {
            organization: '=',
            fund: '=',
            hideModal: '=',
            onApply: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'ProviderFundService',
            'ModalService',
            FundCardProviderCanJoinDirective
        ],
        templateUrl:  ($el, $attr) => {
            let template = $attr.template || 'fund-card-provider-can-join';
            return 'assets/tpl/directives/' + template + '.html'
        }
    };
};