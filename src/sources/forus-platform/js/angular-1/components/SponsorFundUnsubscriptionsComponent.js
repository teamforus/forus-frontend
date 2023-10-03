const SponsorFundUnsubscriptionsComponent = function (
    $state,
    LocalStorageService,
    PageLoadingBarService,
    FundUnsubscribeService,
) {
    const $ctrl = this;

    $ctrl.paginationStorageKey = 'fund_unsubscriptions_per_page';

    $ctrl.filters = {
        per_page: LocalStorageService.getCollectionItem('pagination', $ctrl.paginationStorageKey, 10),
    };

    $ctrl.states = [{
        label: 'Alle',
        value: null,
    }, {
        label: 'In afwachting',
        value: 'pending',
    }, {
        label: 'Gearchiveerd',
        value: 'approved',
    }, {
        label: 'Geannuleerd',
        value: 'canceled',
    }];

    $ctrl.setState = (state) => {
        $ctrl.state = state.value;
        $ctrl.loading = true;
        $ctrl.filters.state = state.value;

        $state.go($state.current.name, { state: $ctrl.state });
    };

    $ctrl.fetchUnsubscriptions = (filters = {}) => {
        return FundUnsubscribeService.listSponsor($ctrl.organization.id, { ...filters });
    };

    $ctrl.onPageChange = (filters = {}) => {
        PageLoadingBarService.setProgress(0);

        return $ctrl.fetchUnsubscriptions(filters).then((res) => $ctrl.fundUnsubscribes = res.data).finally(() => {
            $ctrl.loading = false;
            PageLoadingBarService.setProgress(100);
        });
    };

    $ctrl.showTooltip = (e, target) => {
        e.stopPropagation();
        $ctrl.fundUnsubscribes.data.forEach((item) => item.showTooltip = item == target);
    };

    $ctrl.hideTooltip = (e, item) => {
        e.stopPropagation();
        e.preventDefault();
        item.showTooltip = false;
    };

    $ctrl.$onInit = () => {
        const state = $state?.params?.state || null;
        const stateItem = state ? $ctrl.states.find((state) => state.value == state) : null;

        $ctrl.setState(stateItem ? stateItem : $ctrl.states[0]);
        $ctrl.onPageChange($ctrl.filters);
    };
};

module.exports = {
    bindings: {
        state: '<',
        organization: '<',
    },
    controller: [
        '$state',
        'LocalStorageService',
        'PageLoadingBarService',
        'FundUnsubscribeService',
        SponsorFundUnsubscriptionsComponent,
    ],
    templateUrl: 'assets/tpl/pages/sponsor-fund-unsubscriptions.html',
};