let FundCardDirective = function(
    $scope, 
    $state, 
    $rootScope, 
    FundService, 
    ProviderFundService
) {
    let getRndInteger = function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    $scope.showModal = false;
    $scope.modalCode = "";

    $scope.openModal = function() {
        $scope.modalCode = getRndInteger(1000, 9999);
        $scope.showModal = true;
    };

    $scope.closeModal = function() {
        $scope.showModal = false;
    };

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
            'ProviderFundService',
            FundCardDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-card-sponsor.html' 
    };
};