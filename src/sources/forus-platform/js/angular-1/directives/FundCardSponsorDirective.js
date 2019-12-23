let sprintf = require('sprintf-js').sprintf;

let FundCardDirective = function(
    $scope,
    $state,
    FundService,
    ModalService,
    ProviderFundService,
    PushNotificationsService,
    PermissionsService
) {
    let $dir = $scope.$dir = {};
    let topUpInProgress = false;

    $dir.fund = $scope.fund;
    $dir.inviteProviders = $scope.inviteProviders || false;
    $dir.canTopUpFund = $dir.fund.key && $dir.fund.state != 'closed';
    $dir.canAccessFund = $scope.fund.state != 'closed';
    $dir.canInviteProviders = ($dir.fund.organization && PermissionsService.hasPermission(
            $dir.fund.organization, 'manage_funds')
        ) && $scope.fund.state != 'closed' && $dir.inviteProviders;

    $dir.changeState = function(state) {
        FundService.changeState($scope.fund, state).then((res) => {
            $scope.fund = res.data.data;
        });
    };

    $dir.providerApplyFund = function(fund) {
        ProviderFundService.applyForFund(
            $scope.organization.id,
            $scope.fund.id
        ).then(() => $state.reload());
    };

    $dir.topUpModal = () => {
        if (!topUpInProgress) {
            topUpInProgress = true;

            ModalService.open('fundTopUp', {
                fund: $scope.fund
            }, {
                onClose: () => topUpInProgress = false
            });
        }
    };

    $dir.deleteFund = function(fund) {
        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'fund_card_sponsor.confirm_delete.title',
            icon: 'product-error',
            description: 'fund_card_sponsor.confirm_delete.description',
            confirm: () => FundService.destroy(
                fund.organization_id,
                fund.id
            ).then(() => $state.reload())
        });
    };

    $dir.inviteProvider = () => {
        if ($dir.canInviteProviders) {
            ModalService.open('fundInviteProviders', {
                fund: $scope.fund,
                confirm: (res) => {
                    PushNotificationsService.success(
                        "Aanbiders uitgenodigd!",
                        sprintf("%s uitnodigingen verstuurt naar aanbieders!", res.length),
                    ) & $state.reload();
                }
            });
        }
    };

    $dir.goToEmployeePage = () => {
        $state.go('employees', {
            organization_id: $dir.fund.organization.id
        });
    }

    $dir.goToCSVValiationPage = () => {
        if ($dir.canAccessFund) {
            $state.go('csv-validation', {
                fund_id: $dir.fund.id
            });
        }
    }
};

module.exports = () => {
    return {
        scope: {
            organization: '=',
            fund: '=',
            level: '=',
            inviteProviders: '<'
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            'FundService',
            'ModalService',
            'ProviderFundService',
            'PushNotificationsService',
            'PermissionsService',
            FundCardDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-card-sponsor.html'
    };
};
