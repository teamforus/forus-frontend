const ProviderFundsComponent = function ($state, ProviderFundService) {
    const $ctrl = this;

    $ctrl.fetchFunds = (filters = {}) => {
        return ProviderFundService
            .listAvailableFunds($ctrl.organization.id, { per_page: 1, ...filters })
            .then((res) => $ctrl.fundsAvailable = res.data);
    };

    $ctrl.onChange = (filters = {}) => {
        $ctrl.fetchFunds(filters);
    };

    $ctrl.onChangeAvailable = (filters = {}) => {
        $ctrl.onChange(filters);
        $ctrl.setTab('pending_rejected');
    };

    $ctrl.setTab = (tab = {}) => {
        $ctrl.tab = tab;
        $state.go($state.current.name, { tab });
    };
};

module.exports = {
    bindings: {
        tab: '<',
        organization: '<',
        fundsAvailable: '<',
    },
    controller: [
        '$state',
        'ProviderFundService',
        ProviderFundsComponent,
    ],
    templateUrl: 'assets/tpl/pages/provider-funds.html',
};