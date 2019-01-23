let OrganizationProvidersComponent = function(
    $state,
    $scope,
    FundService,
    FileService,
    OrganizationService
) {
    let $ctrl = this;
    let org = OrganizationService.active();

    $ctrl.filters = {
        show: false,
        values: {},
    };

    $ctrl.states = [{
        key: null,
        name: 'Alle'
    }, {
        key: 'approved',
        name: 'Geaccepteerd'
    }, {
        key: 'declined',
        name: 'Geweigerd'
    }, {
        key: 'pending',
        name: 'Wachtend'
    }];


    $ctrl.resetFilters = () => {
        $ctrl.filters.values.q = '';
        $ctrl.filters.values.state = $ctrl.states[0].key;
    };

    $ctrl.$onInit = function() {
        $ctrl.resetFilters();

        $ctrl.fundProviders.data.map(function(providerFund) {
            providerFund.organization.fundCategories =
                providerFund.organization.product_categories.map(function(category) {
                    return category.name;
                });

            providerFund.collapsed = providerFund.state == 'approved';
            providerFund.collapsable = providerFund.state == 'approved';

            return providerFund;
        });
    };

    $ctrl.toggleFundCollapse = function(providerFund) {
        if (providerFund.collapsable) {
            providerFund.collapsed = !providerFund.collapsed;
        }
    };

    $ctrl.approveProvider = function(providerFund) {
        FundService.approveProvider(
            providerFund.fund.organization_id,
            providerFund.fund.id,
            providerFund.id
        ).then((res) => {
            $state.reload();
        });
    };

    $ctrl.declineProvider = function(providerFund) {
        FundService.declineProvider(
            providerFund.fund.organization_id,
            providerFund.fund.id,
            providerFund.id
        ).then((res) => {
            $state.reload();
        });
    };

    $scope.onPageChange = async (query) => {
        let filters = Object.assign({}, query, $ctrl.filters.values);

        OrganizationService.listProviders(
            $ctrl.organization.id,
            filters
        ).then((res => {

            $ctrl.fundProviders = res.data;

            $ctrl.fundProviders.data.map(function(providerFund) {
                providerFund.organization.fundCategories =
                    providerFund.organization.product_categories.map(function(category) {
                        return category.name;
                    });

                providerFund.collapsed = providerFund.state == 'approved';
                providerFund.collapsable = providerFund.state == 'approved';

                return providerFund;
            });
        }));
    };

    // Export to XLS file
    $ctrl.exportList = () => {
        OrganizationService.listProvidersExport(
            $ctrl.organization.id,
            $ctrl.filters.values
        ).then((res => {
            FileService.downloadFile(
                'providers_'  + org + '_' + moment().format(
                    'YYYY-MM-DD HH:mm:ss'
                ) + '.xls',
                res.data,
                res.headers('Content-Type') + ';charset=utf-8;'
            );
        }));
    };

    $ctrl.hideFilters = () => {
        $scope.$apply(() => {
            $ctrl.filters.show = false;
        });
    };
};

module.exports = {
    bindings: {
        fundProviders: '<',
        organization: '<'
    },
    controller: [
        '$state',
        '$scope',
        'FundService',
        'FileService',
        'OrganizationService',
        OrganizationProvidersComponent
    ],
    templateUrl: 'assets/tpl/pages/organization-providers.html'
};
