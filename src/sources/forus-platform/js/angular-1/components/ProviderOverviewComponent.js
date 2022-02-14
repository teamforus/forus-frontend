let ProviderOverviewComponent = function(
    $state,
    $stateParams,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.routeData = {};
    $ctrl.maxProductCount = parseInt(appConfigs.features.products_hard_limit);

    $ctrl.applyFund = function() {
        $state.go('provider-funds', { ...$ctrl.routeData, ...{ fundsType: 'available' } });
    };

    const is_approved = (fund) => {
        return fund.state === 'approved';
    }

    let is_closed = (fund) => {
        return fund.fund.state == 'closed';
    }

    $ctrl.$onInit = function() {
        $ctrl.routeData = { organization_id: $stateParams.organization_id };

        $ctrl.funds = $ctrl.funds.filter(fund => is_approved(fund) && !is_closed(fund));
    };
};

module.exports = {
    bindings: {
        transactionsTotal: '<',
        employeesTotal: '<',
        productsTotal: '<',
        organization: '<',
        funds: '<',
    },
    controller: [
        '$state',
        '$stateParams',
        'appConfigs',
        ProviderOverviewComponent
    ],
    templateUrl: 'assets/tpl/pages/provider-overview.html'
};