let OrganizationProvidersComponent = function(
    $state,
    $stateParams,
    FundService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.fundProviders.map(function(providerFund) {
            providerFund.organization.fundCategories = 
            providerFund.organization.product_categories.map(function(category) {
                return category.name;
            });
        });
    };

    $ctrl.approveProvider = function(providerFund) {
        FundService.approveProvider(
            providerFund.fund.organization_id,
            providerFund.fund.id,
            providerFund.id
        ).then((res) => {
            console.log('approveProvider', res);
            $state.reload();
        });
    }

    $ctrl.declineProvider = function(providerFund) {
        FundService.declineProvider(
            providerFund.fund.organization_id,
            providerFund.fund.id,
            providerFund.id
        ).then((res) => {
            console.log('declineProvider', res);
            $state.reload();
        });
    }
};

module.exports = {
    bindings: {
        fundProviders: '<'
    },
    controller: [
        '$state',
        '$stateParams',
        'FundService',
        OrganizationProvidersComponent
    ],
    templateUrl: 'assets/tpl/pages/organization-providers.html'
};