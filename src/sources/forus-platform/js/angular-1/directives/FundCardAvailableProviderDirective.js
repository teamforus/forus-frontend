let FundCardAvailableProviderDirective = function(
    $scope, 
    $state,
    $filter,
    ProviderFundService,
    ModalService,
    OfficeService
) {
    $scope.fundCategories = $scope.fund.product_categories.map((val) => {
        return val.name;
    });

    $scope.providerApplyFund = function(fund) {

        OfficeService.list(
            $scope.organization.id
        ).then(function(res) {

            if(res.data.data.length) {
                ProviderFundService.applyForFund(
                    $scope.organization.id,
                    $scope.fund.id
                ).then(function (res) {

                    ModalService.open('modalNotification', {
                        type: 'info',
                        title: 'provider_funds_available.applied_for_fund.title',
                        description: 'provider_funds_available.applied_for_fund.description',
                        icon: 'fund_applied',
                        closeBtnText: 'modal.buttons.confirm',
                    }, {
                        onClose: () => $state.reload()
                    });

                });
            }else{
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
            fund: '='
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            '$filter',
            'ProviderFundService',
            'ModalService',
            'OfficeService',
            FundCardAvailableProviderDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-card-available-provider.html' 
    };
};