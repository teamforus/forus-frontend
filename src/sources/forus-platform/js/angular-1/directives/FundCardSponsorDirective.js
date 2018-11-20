let FundCardDirective = function(
    $scope,
    $state,
    $rootScope,
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
    }

    $scope.editable = false;

    $scope.userCanEdit = function() {
        if (!$rootScope.auth_user.organizationsIds) {
            return false;
        }

        $scope.editable = $rootScope.auth_user.organizationsIds.indexOf(
            $scope.fund.organization_id
        ) != -1;

        return $scope.editable;
    }
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
            '$rootScope',
            'FundService',
            'ModalService',
            'ProviderFundService',
            FundCardDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-card-sponsor.html'
    };
};