let FundCardDirective = function(
    $scope,
    $state,
    FundService,
    ModalService,
    ProviderFundService
) {
    let topUpInProgress = false;

    $scope.fundCategories = $scope.fund.product_categories.map((val) => {
        return val.name;
    });

    $scope.changeState = function(state) {
        FundService.changeState($scope.fund, state).then((res) => {
            $scope.fund = res.data.data;
        });
    };

    $scope.providerApplyFund = function(fund) {
        ProviderFundService.applyForFund(
            $scope.organization.id,
            $scope.fund.id
        ).then(function(res) {
            $state.reload();
        });
    };

    $scope.topUpModal = () => {
        if (topUpInProgress) return;

        topUpInProgress = true;

        ModalService.open('fundTopUp', {
            fund: $scope.fund
        }, {
            onClose: () => topUpInProgress = false
        });
    };

    $scope.deleteFund = function(fund) {

        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'fund_card_sponsor.confirm_delete.title',
            icon: 'product-error',
            description: 'fund_card_sponsor.confirm_delete.description',
            confirm: () => {
                FundService.destroy(
                    fund.organization_id,
                    fund.id
                ).then(function(res) {
                    $state.reload();
                });
            }
        });
    };

    $scope.fundOrg = $scope.fund.organization;
};

module.exports = () => {
    return {
        scope: {
            organization: '=',
            fund: '=',
            level: '='
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            'FundService',
            'ModalService',
            'ProviderFundService',
            FundCardDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-card-sponsor.html'
    };
};