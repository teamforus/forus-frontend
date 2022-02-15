let SponsorProviderOrganizationComponent = function(
    $q,
    $timeout,
    $state,
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

    $ctrl.onProviderFundsPageChange = (query = {}) => {
        fetchFundProviders($ctrl.providerOrganization, query).then((fundProviders) => {
            $ctrl.fundProviders = fundProviders;
            $ctrl.fundProviders.data.forEach((fundProvider) => fundProvider.active = fundProvider.state === 'accepted');
        });
    };

    $ctrl.updateFundProviderAllow = function(fundProvider, allowType) {
        if (fundProvider.active) {
            FundService.updateProvider(
                fundProvider.fund.organization_id,
                fundProvider.fund.id,
                fundProvider.id,
                {[allowType]: fundProvider[allowType]}
            ).then((res) => $timeout(() => {
                PushNotificationsService.success('Opgeslagen!');
                res.data.data.active = res.data.data.state === 'approved'
                $ctrl.fundProviders.data[$ctrl.fundProviders.data.indexOf(fundProvider)] = res.data.data;
            }, 500), console.error);
        }
    };

    $ctrl.fundProviderDecline = (fundProvider) => {
        FundService.declineProvider(
            fundProvider.fund.organization_id,
            fundProvider.fund.id,
            fundProvider.id
        ).then((res) => $timeout(() => {
            PushNotificationsService.success('Opgeslagen!');
            res.data.data.active = res.data.data.state === 'approved'
            $ctrl.fundProviders.data[$ctrl.fundProviders.data.indexOf(fundProvider)] = res.data.data;
        }, 500), console.error);
    };

    $ctrl.fundProviderApprove = (fundProvider) => {
        FundService.approveProvider(
            fundProvider.fund.organization_id,
            fundProvider.fund.id,
            fundProvider.id
        ).then((res) => $timeout(() => {
            PushNotificationsService.success('Opgeslagen!');
            res.data.data.active = res.data.data.state === 'approved'
            $ctrl.fundProviders.data[$ctrl.fundProviders.data.indexOf(fundProvider)] = res.data.data;
        }, 500), console.error);
    };

    $ctrl.viewProvider = (fundProvider) => {
        $state.go('fund-provider', {
            organization_id: $ctrl.organization.id,
            fund_id: fundProvider.fund_id,
            fund_provider_id: fundProvider.id
        });
    }

    $ctrl.$onInit = function() {
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
        '$timeout',
        '$state',
        'FundService',
        'OrganizationService',
        'PushNotificationsService',
        SponsorProviderOrganizationComponent
    ],
    templateUrl: 'assets/tpl/pages/sponsor-provider-organization.html'
};