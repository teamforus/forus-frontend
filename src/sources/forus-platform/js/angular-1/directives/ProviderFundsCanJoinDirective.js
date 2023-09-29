const ProviderFundsCanJoinDirective = function (
    $q,
    $scope,
    $filter,
    LocalStorageService,
    ProviderFundService,
    PageLoadingBarService,
) {
    const $dir = $scope.$dir;
    const $translate = $filter('translate');

    $dir.paginationStorageKey = 'provider_funds_join_per_page';

    $dir.selected = [];

    $dir.filters = {
        visible: false,
        values: {
            q: "",
            page: 1,
            tag: null,
            per_page: LocalStorageService.getCollectionItem('pagination', $dir.paginationStorageKey, 10),
            organization_id: null,
        },
    };

    $dir.toggleAll = (e, items = []) => {
        e?.stopPropagation();

        $dir.selected = $dir.selected.length === items.length ? [] : items.map((item) => item.id);
    };

    $dir.toggle = (e, item) => {
        e?.stopPropagation();

        if ($dir.selected.includes(item.id)) {
            $dir.selected.splice($dir.selected.indexOf(item.id), 1);
        } else {
            $dir.selected.push(item.id);
        }
    };

    $dir.fetchAvailableFunds = (organization, query) => {
        return ProviderFundService.listAvailableFunds(organization.id, query);
    };

    $dir.onPageChange = (filters = {}) => {
        PageLoadingBarService.setProgress(0);

        return $dir.fetchAvailableFunds($dir.organization, filters).then((res) => {
            $dir.funds = res.data;

            $dir.tags = $dir.tags ? $dir.tags : [{
                key: null,
                name: $translate('provider_funds.filters.options.all_labels'),
            }, ...$dir.funds.meta.tags];

            $dir.organizations = $dir.organizations ? $dir.organizations : [{
                id: null,
                name: $translate('provider_funds.filters.options.all_organizations'),
            }, ...$dir.funds.meta.organizations];
        }).finally(() => PageLoadingBarService.setProgress(100));
    };

    $dir.applyFunds = (fund = null) => {
        const funds = fund ? [fund] : $dir.funds.data.filter((fund) => $dir.selected.includes(fund.id));
        PageLoadingBarService.setProgress(0);

        $q.all(funds.map((fund) => {
            return ProviderFundService.applyForFund($dir.organization.id, fund.id);
        })).then(() => {
            typeof $dir.onApply === 'function' ? $dir.onApply() : null
            funds.forEach((fund) => fund.applied = true);
            $dir.selected = [];
        }).finally(() => PageLoadingBarService.setProgress(100));
    }

    $dir.$onInit = () => {
        $dir.filters.values = {
            ...$dir.filters.values,
            ...($dir.externalFilters ? $dir.externalFilters : {})
        };

        $dir.onPageChange($dir.filters.values);
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            onApply: '&',
            showFilters: '<',
            organization: '=',
            externalFilters: '<',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$q',
            '$scope',
            '$filter',
            'LocalStorageService',
            'ProviderFundService',
            'PageLoadingBarService',
            ProviderFundsCanJoinDirective,
        ],
        templateUrl: 'assets/tpl/directives/provider-funds-can-join.html',
    };
};