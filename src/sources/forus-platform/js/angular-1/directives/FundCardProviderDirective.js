const FundCardProviderDirective = function(
    $scope,
    $filter,
    ModalService,
    ProductService,
    ProviderFundService,
    PushNotificationsService
) {
    const $translate = $filter('translate');
    const $translateDangerZone = (key, params) => {
        return $translate('modals.danger_zone.remove_provider_application.' + key, params);
    };

    $scope.viewOffers = () => {
        ProductService.list($scope.organization.id).then(res => {
            ModalService.open('fundOffers', {
                fund: $scope.fund,
                providerFund: $scope.providerFund,
                organization: $scope.organization,
                offers: res.data,
            });
        }, console.error);
    };

    $scope.cancelApplicationRequest = (providerFund) => {
        const sponsor_organisation_name = $scope.fund.organization.name;

        ModalService.open('dangerZone', {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description', { sponsor_organisation_name }),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            onConfirm: () => $scope.sendCancelApplicationRequest(providerFund),
        });
    };

    $scope.sendCancelApplicationRequest = (providerFund) => {
        ProviderFundService.cancelApplicationRequest($scope.organization.id, providerFund.id).then(() => {
            $scope.providerFunds = $scope.providerFunds.filter(item => item.id !== providerFund.id);
            $scope.showEmptyBlock = $scope.providerFunds.length == 0;

            PushNotificationsService.success('Opgeslagen!');

            if (typeof $scope.onRemoved === 'function') {
                $scope.onRemoved();
            }
        }, console.error);
    };

    $scope.init = function() {
        $scope.fund = $scope.providerFund.fund;
        $scope.media = $scope.fund.logo || $scope.fund.organization.logo;

        $scope.shownProductType = $scope.providerFund.allow_some_products &&
            !$scope.providerFund.allow_products ?
            'allow_some_products' : 'allow_products';
    };

    $scope.init();
};

module.exports = () => {
    return {
        scope: {
            organization: '=',
            providerFund: '=',
            providerFunds: '=',
            showEmptyBlock: '=',
            onRemoved: '&',
            type: '@'
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$filter',
            'ModalService',
            'ProductService',
            'ProviderFundService',
            'PushNotificationsService',
            FundCardProviderDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-card-provider.html'
    };
};