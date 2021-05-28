const ProviderFundsComponent = function(
    $stateParams,
    $filter,
    ProviderFundService,
) {
    const $ctrl = this;
    const $translate = $filter('translate');

    const sort = {
        'pending': 0,
        'approved': 1,
        'declined': 2,
    };

    const is_pending_or_rejected = (fund) => {
        return (!fund.allow_budget && !fund.allow_products && !fund.allow_some_products) || fund.dismissed;
    }

    const is_closed = (fund) => {
        return fund.fund.state == 'closed';
    }

    const trans_fund_provider = (key) => {
        return $translate('fund_card_provider.empty_block.' + key);
    };

    $ctrl.shownFundsType = $stateParams.fundsType || 'active';
    $ctrl.showEmptyBlock = false;

    $ctrl.$onInit = function() {
        $ctrl.shownFundsType = $stateParams.fundsType ||
            ($ctrl.funds.length ? 'active' : 'available');

        $ctrl.fundAvailableInvitations = $ctrl.fundInvitations.filter(
            fundInvitation => !fundInvitation.expired
        );

        $ctrl.archiveFunds = $ctrl.fundInvitations.filter(
            fundInvitation => fundInvitation.expired
        ).concat($ctrl.funds.filter(fund => {
            return is_closed(fund);
        }));

        $ctrl.pendingRejectedFunds = $ctrl.funds.filter(fund => {
            return is_pending_or_rejected(fund);
        });

        $ctrl.funds = $ctrl.funds.filter(fund => !is_pending_or_rejected(fund) && !is_closed(fund));
        $ctrl.funds.sort((a, b) => sort[a.state] - sort[b.state]);

        $ctrl.showEmptyBlock = $ctrl.checkForEmptyList($ctrl.shownFundsType);
        $ctrl.emptyBlockMsg = $ctrl.getEmptyBlockMessage($ctrl.shownFundsType);
    };

    $ctrl.filters = {
        values: {
            q: "",
            per_page: 10
        },
    };

    const getAvailableFunds = (organization, query) => {
        ProviderFundService.listAvailableFunds(organization.id, query).then(res => {
            $ctrl.fundsAvailable = { ...res.data };
        });
    };

    $ctrl.onPageChange = (query) => {
        getAvailableFunds($ctrl.organization, {
            per_page: query.per_page,
            page: query.page,
        });
    };

    $ctrl.filterByFundStatus = (type) => {
        $ctrl.shownFundsType = type;
        $ctrl.showEmptyBlock = $ctrl.checkForEmptyList(type);
        $ctrl.emptyBlockMsg = $ctrl.getEmptyBlockMessage(type);
    };

    $ctrl.checkForEmptyList = (type) => $ctrl.getActiveFundsCount(type) == 0;

    $ctrl.getActiveFundsCount = (type) => ({
        available: $ctrl.fundsAvailable.meta.total,
        active: $ctrl.funds.length,
        invitations: $ctrl.fundAvailableInvitations.length,
        pending_rejected: $ctrl.pendingRejectedFunds.length,
        expired_closed: $ctrl.archiveFunds.length,
    }[type]);

    $ctrl.getEmptyBlockMessage = (type) => {
        return trans_fund_provider(type);
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
        '$stateParams',
        '$filter',
        'ProviderFundService',
        ProviderFundsComponent
    ],
    templateUrl: 'assets/tpl/pages/provider-funds.html'
};