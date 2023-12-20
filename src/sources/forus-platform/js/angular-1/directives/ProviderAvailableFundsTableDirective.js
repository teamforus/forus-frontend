const ProviderAvailableFundsTableDirective = function (
    $q,
    $scope,
    $filter,
    ModalService,
    ProviderFundService,
    PageLoadingBarService,
) {
    const $dir = $scope.$dir;
    const $translate = $filter('translate');

    $dir.selected = [];
    $dir.selectedMeta = {};

    $dir.filtersDefault = {
        q: "",
        tag: null,
        page: 1,
        per_page: 10,
        organization_id: null,
        implementation_id: null,
        order_by: 'organization_name',
        order_dir: 'asc',
    };

    $dir.filters = {
        visible: false,
        values: angular.copy($dir.filtersDefault),
        hide: (e) => {
            if (e.target.tagName !== 'A') {
                e?.preventDefault();
                e?.stopPropagation();
    
                $dir.filters.visible = false;
            }
        },
        show: (e) => {
            e?.preventDefault();
            e?.stopPropagation();

            $dir.filters.visible = true;
        },
        reset: (e) => {
            e?.preventDefault();
            e?.stopPropagation();

            $dir.filters.visible = null;
            $dir.filters.values = angular.copy($dir.filtersDefault);
        },
    };

    $dir.updateActions = () => {
        const selected = $dir.funds.data?.filter((item) => $dir.selected.includes(item.id));

        $dir.selectedMeta.selected = selected;
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

    $dir.fetchAvailableFunds = (organization, filters = {}) => {
        return ProviderFundService.listAvailableFunds(organization.id, filters);
    };

    $dir.onPageChange = (filters = {}) => {
        $dir.selected = [];
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

            $dir.implementations = $dir.implementations ? $dir.implementations : [{
                id: null,
                name: $translate('provider_funds.filters.options.all_implementations'),
            }, ...$dir.funds.meta.implementations];
        }).finally(() => PageLoadingBarService.setProgress(100));
    };

    $dir.successApplying = () => {
        return ModalService.open('modalNotification', {
            type: 'info',
            title: 'provider_funds.available.applied_for_fund.title',
            description: 'provider_funds.available.applied_for_fund.description',
            icon: 'fund_applied',
            closeBtnText: 'modal.buttons.confirm',
        });
    }

    $dir.failOfficesCheck = () => {
        return ModalService.open('modalNotification', {
            type: 'danger',
            title: 'provider_funds.available.error_apply.title',
            description: $filter('i18n')('provider_funds.available.error_apply.description')
        });
    }

    $dir.applyFunds = (funds) => {
        if ($dir.organization.offices_count == 0) {
            return $dir.failOfficesCheck();
        }

        $q.all(funds.map((fund) => {
            return ProviderFundService.applyForFund($dir.organization.id, fund.id);
        })).then(() => {
            $dir.successApplying();
            $dir.selected = [];
        }).finally(() => {
            $dir.onPageChange($dir.filters.values);
            typeof $dir.onChange === 'function' ? $dir.onChange() : null;
        });
    };

    $dir.$onInit = () => {
        $dir.loading = true;

        $dir.onPageChange($dir.filters.values).finally(() => {
            $dir.loading = false;
            $scope.$watch('$dir.selected', () => $dir.updateActions(), true);
            $scope.$watch('$dir.funds', () => $dir.updateActions(), true);
        });
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            onChange: '&',
            organization: '=',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$q',
            '$scope',
            '$filter',
            'ModalService',
            'ProviderFundService',
            'PageLoadingBarService',
            ProviderAvailableFundsTableDirective,
        ],
        templateUrl: 'assets/tpl/directives/provider-available-funds-table.html',
    };
};