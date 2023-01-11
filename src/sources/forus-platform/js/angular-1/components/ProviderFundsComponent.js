const ProviderFundsComponent = function(
    $stateParams,
    $filter,
    ProviderFundService,
    FundProviderInvitationsService,
    $q,
) {
    const $ctrl = this;
    const $translate = $filter('translate');
    $ctrl.showEmptyBlock = false;

    $ctrl.filters = {
        values: {
            q: "",
            per_page: 10,
            tag: null,
            organization_id: null,
        },
    };

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

    const trans_fund_provider = (key) => {
        return $translate('fund_card_provider.empty_block.' + key);
    };

    const getAvailableFunds = (query) => {
        ProviderFundService.listAvailableFunds($ctrl.organization.id, query).then((res) => {
            $ctrl.fundsAvailable = { ...res.data };
            checkFiltersExists();
        });
    };

    const getFunds = () => {
        return $q((resolve, reject) => {
            ProviderFundService.listFunds($ctrl.organization.id, { per_page: 1000 }).then((res) => {
                $ctrl.funds = res.data.data;
                resolve();
            });
        });
    };

    const getInvitationsFunds = () => {
        return $q((resolve, reject) => {
            FundProviderInvitationsService.listInvitations($ctrl.organization.id).then((res) => {
                $ctrl.fundInvitations = res.data.data;
                resolve();
            });
        });
    };

    const filterFunds = () => {
        $ctrl.fundAvailableInvitations = $ctrl.fundInvitations.filter(
            fundInvitation => !fundInvitation.expired
        );

        $ctrl.archiveFunds = $ctrl.fundInvitations.filter(
            fundInvitation => fundInvitation.expired
        ).concat($ctrl.funds.filter((fund) => {
            return is_closed(fund);
        }));

        $ctrl.pendingRejectedFunds = $ctrl.funds.filter((fund) => is_pending_or_rejected(fund));

        $ctrl.funds = $ctrl.funds.filter(fund => !is_pending_or_rejected(fund) && !is_closed(fund));
        $ctrl.funds.sort((a, b) => sort[a.state] - sort[b.state]);

        $ctrl.showEmptyBlock = $ctrl.checkForEmptyList($ctrl.shownFundsType);
        $ctrl.emptyBlockMsg = $ctrl.getEmptyBlockMessage($ctrl.shownFundsType);
    };

    const checkFiltersExists = () => {
        if ($ctrl.filters.values.tag) {
            const exists = $ctrl.fundsAvailable.meta.tags.filter((tag) => tag.key === $ctrl.filters.values.tag).length;
            $ctrl.filters.values.tag = exists ? $ctrl.filters.values.tag : null;
        }
    };

    $ctrl.reloadFunds = (query) => {
        Promise.all([ getFunds(), getInvitationsFunds() ]).then(() => filterFunds());
        $ctrl.onPageChangeAvailableFunds(query);
    };

    $ctrl.onPageChangeAvailableFunds = (query) => {
        getAvailableFunds({
            per_page: query.per_page,
            page: query.page,
            tag: query.tag,
            organization_id: query.organization_id,
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

    $ctrl.getEmptyBlockMessage = (type) => trans_fund_provider(type);

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
        '$stateParams',
        '$filter',
        'ProviderFundService',
        'FundProviderInvitationsService',
        '$q',
        ProviderFundsComponent
    ],
    templateUrl: 'assets/tpl/pages/provider-funds.html'
};