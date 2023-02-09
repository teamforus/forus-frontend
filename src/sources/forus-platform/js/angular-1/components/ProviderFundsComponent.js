const ProviderFundsComponent = function(
    ProviderFundService,
    FundProviderInvitationsService,
    $stateParams,
    $q,
) {
    const $ctrl = this;
    $ctrl.reloadAvailableFunds = false;

    const sort = {
        'pending': 0,
        'approved': 1,
        'declined': 2,
    };

    const is_pending_or_rejected = (fund) => {
        return (!fund.allow_budget && !fund.allow_products && !fund.allow_some_products) || fund.dismissed;
    };

    const is_closed = (fund) => {
        return fund.fund.state == 'closed';
    };

    $ctrl.filterByFundStatus = (type) => $ctrl.shownFundsType = type;

    const filterFunds = () => {
        $ctrl.fundAvailableInvitations = $ctrl.fundInvitations.filter(
            fundInvitation => !fundInvitation.expired
        );

        $ctrl.archiveFunds = $ctrl.fundInvitations.filter(
            fundInvitation => fundInvitation.expired
        ).concat($ctrl.funds.filter((fund) => {
            return is_closed(fund);
        }));

        $ctrl.pendingRejectedFunds = $ctrl.funds.filter((fund) => {
            return is_pending_or_rejected(fund);
        });

        $ctrl.funds = $ctrl.funds.filter(fund => !is_pending_or_rejected(fund) && !is_closed(fund));
        $ctrl.funds.sort((a, b) => sort[a.state] - sort[b.state]);
    };

    const fetchFunds = () => {
        return ProviderFundService.listFunds($ctrl.organization.id, {per_page: 1000,})
            .then((res) => $ctrl.funds = res.data.data);
    };

    const fetchInvitations = () => {
        return FundProviderInvitationsService.listInvitations($ctrl.organization.id)
            .then((res) => $ctrl.fundInvitations = res.data.data);
    };

    $ctrl.onChange = () => {
        $ctrl.reloadAvailableFunds = true;

        const promises = [
            fetchFunds(),
            fetchInvitations()
        ];

        $q.all(promises).then(() => filterFunds());
    };

    $ctrl.$onInit = function() {
        $ctrl.shownFundsType = $stateParams.fundsType || ($ctrl.funds.length ? 'active' : 'available');

        filterFunds();
    };
};

module.exports = {
    bindings: {
        funds: '<',
        fundsAvailable: '<',
        fundInvitations: '<',
        fundLevel: '<',
        organization: '<',
    },
    controller: [
        'ProviderFundService',
        'FundProviderInvitationsService',
        '$stateParams',
        '$q',
        ProviderFundsComponent
    ],
    templateUrl: 'assets/tpl/pages/provider-funds.html'
};