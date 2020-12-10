let ProviderOverviewComponent = function(
    $state,
    $stateParams,
    OrganizationEmployeesService,
    TransactionService,
    ProductService,
    appConfigs
) {
    let $ctrl = this;
    $ctrl.transactionsTotal = 0;
    $ctrl.productsTotal = 0;

    $ctrl.maxProductCount = parseInt(appConfigs.features.products_hard_limit);
    $ctrl.maxProductSoftLimit = parseInt(appConfigs.features.products_soft_limit);

    $ctrl.addProduct = function() {
        if (!$ctrl.maxProductCount || $ctrl.products.meta.total < $ctrl.maxProductCount) {
            $state.go('products-create', {
                organization_id: $stateParams.organization_id
            });
        }
    };

    $ctrl.goTransactions = function() {
        $state.go('transactions', {
            organization_id: $stateParams.organization_id
        });
    };

    $ctrl.goEmployees = function() {
        $state.go('employees', {
            organization_id: $stateParams.organization_id
        });
    };


    $ctrl.applyFund = function() {
        $state.go('provider-funds', {
            organization_id: $stateParams.organization_id,
            fundsType: 'available'
        });
    };


    let getEmployees = (organization) => {
        OrganizationEmployeesService.list(
            organization.id
        ).then(res => {
            $ctrl.employees = {
                meta: res.data.meta,
                data: res.data.data
            };
        });
    }

    let getTransactionTotal = (organization) => {
        TransactionService.list(
            appConfigs.panel_type,
            organization.id
        ).then((res => {         
            $ctrl.transactionsTotal = res.data.meta.total_amount;
        }));
    }

    let getProductTotal = (organization) => {
        ProductService.list(
            organization.id
        ).then(res => {
            $ctrl.products = {
                meta: res.data.meta,
                data: res.data.data,
            };

            $ctrl.productsTotal = res.data.meta.total;
        });
    }

    let is_pending_or_rejected = (fund) => {
        return (!fund.allow_budget && !fund.allow_products && !fund.allow_some_products) || fund.dismissed;
    }

    let is_closed = (fund) => {
        return fund.fund.state == 'closed';
    }
    
    $ctrl.$onInit = function() {
        let sort = {
            'pending': 0,
            'approved': 1,
            'declined': 2,
        };

        $ctrl.funds = $ctrl.funds.filter(fund => {
            return !is_pending_or_rejected(fund) && !is_closed(fund);
        });
        $ctrl.funds = $ctrl.funds.sort((a, b) => sort[a.state] - sort[b.state]);
        getTransactionTotal($ctrl.organization);
        getEmployees($ctrl.organization);
        getProductTotal($ctrl.organization);
    };
};

module.exports = {
    bindings: {
        organization: '<',
        funds: '<'
    },
    controller: [
        '$state',
        '$stateParams',
        'OrganizationEmployeesService',
        'TransactionService',
        'ProductService',
        'appConfigs',
        ProviderOverviewComponent
    ],
    templateUrl: 'assets/tpl/pages/provider-overview.html'
};