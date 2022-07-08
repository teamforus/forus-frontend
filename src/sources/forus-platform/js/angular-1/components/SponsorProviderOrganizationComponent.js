const SponsorProviderOrganizationComponent = function (
    $q,
    FundService,
    OrganizationService,
    PushNotificationsService
) {
    const $ctrl = this;

    const filters = { values: { q: "", per_page: 2 } };
    const providerFilters = { values: { q: "", per_page: 10 } };

    const fetchFundProviders = (providerOrganization, query = {}) => {
        return $q((resolve, reject) => OrganizationService.listProviders(
            $ctrl.organization.id,
            { ...{ organization_id: providerOrganization.id }, ...query }
        ).then((res) => resolve(res.data), reject));
    };

    const transformFundProvider = (fundProvider) => {
        const srefParams = {
            organization_id: $ctrl.organization.id,
            fund_id: fundProvider.fund_id,
            fund_provider_id: fundProvider.id,
        };

        return { ...fundProvider, srefParams };
    };

    $ctrl.updateFundProviderState = (fundProvider, accepted) => {
        const state = accepted ? 'accepted' : 'rejected';

        FundService.confirmFundProviderStateUpdate(fundProvider, state).then((data) => {
            fundProvider.submittingState = state;

            $ctrl.updateProvider(fundProvider, data).finally(() => {
                fundProvider.submittingState = false;
            });
        });
    };

    $ctrl.updateProvider = (fundProvider, query) => {
        return FundService.updateProvider(
            fundProvider.fund.organization_id,
            fundProvider.fund.id,
            fundProvider.id,
            query
        ).then((res) => {
            PushNotificationsService.success('Opgeslagen!');
            $ctrl.fundProviders.data[$ctrl.fundProviders.data.indexOf(fundProvider)] = transformFundProvider(res.data.data);
        }, console.error);
    };

    $ctrl.onProviderFundsPageChange = (query = {}) => {
        fetchFundProviders($ctrl.providerOrganization, query).then((fundProviders) => {
            $ctrl.fundProviders = { ...fundProviders, data: fundProviders.data.map(transformFundProvider) };
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.tab = "employees";
        $ctrl.filters = filters;
        $ctrl.providerFilters = providerFilters;

        $ctrl.onProviderFundsPageChange($ctrl.providerFilters.values);
    };
};

module.exports = {
    bindings: {
        organization: '<',
        providerOrganization: '<',
    },
    controller: [
        '$q',
        'FundService',
        'OrganizationService',
        'PushNotificationsService',
        SponsorProviderOrganizationComponent
    ],
    templateUrl: 'assets/tpl/pages/sponsor-provider-organization.html'
};