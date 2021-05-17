let FundCardProviderDirective = function(
    $scope,
    $filter,
    ModalService,
    ProductService,
    ProviderFundService,
    PushNotificationsService
) {
    $scope.fund = $scope.providerFund.fund;
    let $translate = $filter('translate');
    let $translateDangerZone = (key, params) => $translate(
        'modals.danger_zone.remove_provider_application.' + key, params
    );

    $scope.shownProductType = $scope.providerFund.allow_some_products && 
        !$scope.providerFund.allow_products ?
        'allow_some_products' : 'allow_products';
    
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
    
    $scope.cancelApplication = (providerFund) => {
        ModalService.open('dangerZone', {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description', {sponsor_organisation_name: $scope.fund.organization.name}),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),

            onConfirm: () => {
                ProviderFundService.cancelForFund(
                    $scope.organization.id,
                    providerFund.id
                ).then(res => {
                    PushNotificationsService.success('Opgeslagen!');

                    $scope.providerFunds  = $scope.providerFunds.filter(item => item.id !== providerFund.id);
                    $scope.showEmptyBlock = $scope.providerFunds.length == 0;
                }, console.error);
            }
        });
    };
};

module.exports = () => {
    return {
        scope: {
            organization: '=',
            providerFund: '=',
            providerFunds: '=',
            showEmptyBlock: '=',
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