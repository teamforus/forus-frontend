const FundProviderProductSubsidyEditComponent = function(
    $state,
    $stateParams,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.max = (a, b) => Math.max(a, b);

    $ctrl.loaded = false;
    $ctrl.stateParams = {};

    $ctrl.makeStateParams = () => ({
        sponsor_provider_organization: {
            organization_id: $ctrl.organization.id,
            provider_organization_id: $ctrl.fundProvider.organization.id
        },
        fund_provider_product: {
            organization_id: $ctrl.organization.id,
            fund_id: $ctrl.fund.id,
            fund_provider_id: $ctrl.fundProvider.id,
            product_id: $ctrl.product.id
        },
    });

    $ctrl.onCancel = () => {
        $state.go("fund-provider-product", $ctrl.stateParams.fund_provider_product);
    };

    $ctrl.onUpdate = () => {
        $state.go('fund-provider-product', $ctrl.stateParams.fund_provider_product);
        PushNotificationsService.success("Het product is goedgekeurd.");
    };

    $ctrl.onValuesChange = (values) => {
        $ctrl.values = values;
    };

    $ctrl.$onInit = () => {
        const deal_id = $stateParams.deal_id || false;
        const deal = $ctrl.product.deals_history.find((deal) => deal_id ? deal.id == deal_id : deal.active) || false;

        if (deal_id && !deal || $ctrl.fund.type !== 'subsidies') {
            return $state.go('fund-provider', $stateParams);
        }
        
        $ctrl.deal = deal;
        $ctrl.loaded = true;
        $ctrl.readOnly = deal_id || ($ctrl.fundProvider.products.indexOf($ctrl.product.id) !== -1);
        $ctrl.stateParams = $ctrl.makeStateParams();
    };
};

module.exports = {
    bindings: {
        fund: '<',
        product: '<',
        organization: '<',
        fundProvider: '<',
    },
    controller: [
        '$state',
        '$stateParams',
        'PushNotificationsService',
        FundProviderProductSubsidyEditComponent,
    ],
    templateUrl: 'assets/tpl/pages/fund-provider-product-subsidy-edit.html',
};
