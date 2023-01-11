let FundCardAvailableProviderDirective = function(
    $scope,
    $filter,
    ProviderFundService,
    ModalService,
    OfficeService
) {
    $scope.providerApplyFund = function(fund) {
        OfficeService.list($scope.organization.id, {
            per_page: 100
        }).then(function(res) {
            if (res.data.data.length) {
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
                        onClose: () => $scope.onApply()
                    });
                });
            } else {
                ModalService.open('modalNotification', {
                    type: 'danger',
                    title: 'provider_funds_available.error_apply.title',
                    description: $filter('i18n')('provider_funds_available.error_apply.description', {
                        fund_name: $scope.fund.name
                    })
                });
            }
        });
    };
};

module.exports = () => {
    return {
        scope: {
            organization: '=',
            fund: '=',
            onApply: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$filter',
            'ProviderFundService',
            'ModalService',
            'OfficeService',
            FundCardAvailableProviderDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-card-available-provider.html'
    };
};