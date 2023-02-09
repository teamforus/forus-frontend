const ProviderFundsCanJoinDirective = function (
    ProviderFundService,
    $scope,
    $filter,
    $q
) {
    const $dir = $scope.$dir;
    const $translate = $filter('translate');
    $dir.allSelected = false;
    $dir.hasSelected = false;
    $dir.selectedCount = 0;
    $dir.selected = {};

    $dir.filters = {
        visible: false,
        defaultValues: {
            q: "",
            organization_id: null,
            tag: null,
            per_page: 10,
            page: 1,
        },
        values: {
            q: "",
            per_page: 10,
            organization_id: null,
            tag: null,
        },
    };

    const updateHasSelected = () => {
        const items = [];

        Object.keys($dir.selected).forEach((key) => {
            if ($dir.selected[key]) {
                let fund = $dir.funds.data.filter((item) => item.id == key)[0];
                fund && !fund.applied && items.push(key);
            }
        });

        const notApplied = $dir.funds?.data.filter((item) => !item.applied).length || 0;

        $dir.hasSelected = !!items.length;
        $dir.allSelected = items.length === notApplied;
        $dir.selectedCount = items.length;
    }

    const setFilterData = () => {
        $dir.tags = $dir.funds.meta.tags.slice();
        $dir.organizations = $dir.funds.meta.organizations.slice();

        $dir.tags.unshift({
            key: 'null',
            name: $translate('sign_up_provider.filters.options.all_labels')
        });

        $dir.organizations.unshift({
            id: 'null',
            name: $translate('sign_up_provider.filters.options.all_organizations')
        });

        $dir.filters.values.organization_id = $dir.filters.values.organization_id
            ? $dir.filters.values.organization_id
            : 'null';

        if ($dir.filters.values.tag) {
            const tag = $dir.tags.filter(tag => tag.key === $dir.filters.values.tag)[0];
            if (tag) {
                return;
            }
        }

        $dir.filters.values.tag = 'null';
    }

    const updateExternalFilters = () => {
        $dir.filters.values = { ...$dir.filterValues };
        setFilterData();
    }

    const getAvailableFunds = (organization, query) => {
        ProviderFundService.listAvailableFunds(organization.id, query).then((res) => {
            $dir.funds = res.data;
            updateHasSelected();
            setFilterData();
            $dir.needReload = false;
        });
    };

    $dir.onPageChange = (query = {}) => {
        const tag = query.tag || $dir.filters.values.tag;
        const organization = query.organization_id || $dir.filters.values.organization_id;

        getAvailableFunds($dir.organization, {
            per_page: query.per_page || $dir.filters.values.per_page,
            page: query.page || 1,
            tag: tag === 'null' ? null : tag,
            organization_id: organization === 'null' ? null : organization,
        });
    };

    $dir.selectAll = () => {
        $dir.funds.data.forEach((item) => !item.applied && ($dir.selected[item.id] = true));
        $dir.allSelected = true;
    };

    $dir.deselectAll = () => {
        $dir.allSelected = false;
        $dir.selected = {};
    };

    $dir.applySelectedFunds = () => {
        const promises = [];
        const funds = [];

        Object.keys($dir.selected).forEach((key) => {
            if ($dir.selected[key]) {
                let fund = $dir.funds.data.filter((item) => item.id == key)[0];
                if (fund) {
                    promises.push(ProviderFundService.applyForFund($dir.organization.id, key));
                    funds.push(fund);
                }
            }
        });

        if (promises.length) {
            $q.all(promises).then(() => {
                successApplying();
                funds.forEach((fund) => fund.applied = true);
                $dir.selected = {};
            });
        }
    }

    $dir.applyFund = (fund) => {
        ProviderFundService.applyForFund($dir.organization.id, fund.id).then(() => {
            successApplying();
            fund.applied = true;
            $dir.selected[fund.id] = false;
        });
    };

    const successApplying = () => {
        if (typeof $dir.onApply === 'function') {
            $dir.onApply();
        }
    }

    $dir.$onInit = () => {
        setFilterData();
        $scope.$watch('$dir.selected', updateHasSelected, true);
        $scope.$watch('$dir.filterValues', updateExternalFilters, true);
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            organization: '=',
            funds: '=',
            onApply: '&',
            showFilters: '<',
            filterValues: '<'
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            'ProviderFundService',
            '$scope',
            '$filter',
            '$q',
            ProviderFundsCanJoinDirective
        ],
        templateUrl: 'assets/tpl/directives/provider-funds-can-join.html'
    };
};