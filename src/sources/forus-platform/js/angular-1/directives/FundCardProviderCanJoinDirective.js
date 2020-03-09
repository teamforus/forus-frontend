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
            ModalService.open('modalNotification', {
                type: 'info',
                title: 'provider_funds_available.applied_for_fund.title',
                description: 'provider_funds_available.applied_for_fund.description',
                icon: 'fund_applied',
                closeBtnText: 'modal.buttons.confirm',
            }, {
                onClose: () => $scope.fund.applied = true
            });
        });
    };
};

module.exports = () => {
    return {
        scope: {
            organization: '=',
            fund: '='
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'ProviderFundService',
            'ModalService',
            FundCardProviderCanJoinDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-card-provider-can-join.html'
    };
};