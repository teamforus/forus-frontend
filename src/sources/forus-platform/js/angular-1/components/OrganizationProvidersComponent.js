let OrganizationProvidersComponent = function(
    $state,
    $stateParams,
    $scope,
    FundService,
    FileService,
    OrganizationService
) {
    let $ctrl = this;
    let org = OrganizationService.active();

    $ctrl.filters = {
        show: false,
        values: {
            fund_id: $stateParams.fund_id || null
        },
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
            $ctrl.fundProviders.meta = res.data.meta;
            $ctrl.fundProviders.data = res.data.data.map(providerFund => {
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
                'providers_' + org + '_' + moment().format(
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

    $ctrl.$onInit = function() {
        $ctrl.resetFilters();

        if ($ctrl.fundProviders) {
            $ctrl.fundProviders.data.map(providerFund => {
                providerFund.collapsed = providerFund.state == 'approved';
                providerFund.collapsable = providerFund.state == 'approved';

                return providerFund;
            });
        }

        if (Array.isArray($ctrl.funds)) {
            $ctrl.funds = $ctrl.funds.map(fund => {
                fund.fundCategories = _.pluck(fund.product_categories, 'name').join(', ');
                return fund;
            });

            if ($ctrl.funds.length == 1) {
                $state.go('organization-providers', {
                    organization_id: $stateParams.organization_id,
                    fund_id: $ctrl.funds[0].id
                });
            }
        }

        if ($ctrl.fund) {
            $ctrl.fund.fundCategories = _.pluck($ctrl.fund.product_categories, 'name').join(', ');
        }
    };
};

module.exports = {
    bindings: {
        fundProviders: '<',
        organization: '<',
        funds: '<',
        fund: '<'
    },
    controller: [
        '$state',
        '$stateParams',
        '$scope',
        'FundService',
        'FileService',
        'OrganizationService',
        OrganizationProvidersComponent
    ],
    templateUrl: 'assets/tpl/pages/organization-providers.html'
};
