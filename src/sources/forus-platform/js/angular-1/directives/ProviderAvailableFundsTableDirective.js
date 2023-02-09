const ProviderAvailableFundsTableDirective = function (
    ProviderFundService,
    ModalService,
    PushNotificationsService,
    OfficeService,
    $scope,
    $filter,
    $q
) {
    const $dir = $scope.$dir;
    const $translate = $filter('translate');
    $dir.hasOffices = false;
    $dir.allSelected = false;
    $dir.hasSelected = false;
    $dir.selected = {};
    $dir.selectedCount = 0;

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
        hide: (e) => {
            $dir.filters.visible = false;
        },
        show: (e) => {
            e?.preventDefault();
            e?.stopPropagation();

            $dir.filters.visible = true;
        },
        reset: (e) => {
            e?.preventDefault();
            e?.stopPropagation();

            $dir.filters.values = angular.copy($dir.filters.defaultValues);
        },
    };

    const updateHasSelected = () => {
        const items = [];

        Object.keys($dir.selected).forEach((key) => {
            if ($dir.selected[key]) {
                let fund = $dir.funds.data.filter((item) => item.id == key)[0];
                fund && items.push(key);
            }
        });

        $dir.hasSelected = !!items.length;
        $dir.allSelected = items.length === $dir.funds?.data.length;
        $dir.selectedCount = items.length;
    }

    const setFilterData = () => {
        $dir.tags = $dir.funds.meta.tags.slice();
        $dir.organizations = $dir.funds.meta.organizations.slice();

        $dir.tags.unshift({
            key: 'null',
            name: $translate('provider_funds.filters.options.all_labels')
        });

        $dir.organizations.unshift({
            id: 'null',
            name: $translate('provider_funds.filters.options.all_organizations')
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

    $dir.updateAllSelected = () => {
        $dir.allSelected
            ? $dir.funds.data.forEach((item) => $dir.selected[item.id] = true)
            : $dir.selected = {};
    };

    $dir.applySelectedFunds = () => {
        if ($dir.hasOffices) {
            const promises = [];
            Object.keys($dir.selected).forEach((key) => {
                if ($dir.selected[key]) {
                    let fund = $dir.funds.data.filter((item) => item.id == key)[0];
                    fund && promises.push(ProviderFundService.applyForFund($dir.organization.id, key));
                }
            });

            if (promises.length) {
                $q.all(promises).then(() => {
                    successApplying();
                    $dir.selected = {};
                });
            }
        } else {
            failOfficesCheck();
        }
    }

    $dir.applyFund = (fund) => {
        $dir.hasOffices
            ? ProviderFundService.applyForFund($dir.organization.id, fund.id).then(() => successApplying())
            : failOfficesCheck();
    };

    const checkOffices = () => {
        OfficeService.list($dir.organization.id, { per_page: 100 })
            .then((res) => $dir.hasOffices = res.data.data.length > 0);
    }

    const successApplying = () => {
        return ModalService.open('modalNotification', {
            type: 'info',
            title: 'provider_funds.available.applied_for_fund.title',
            description: 'provider_funds.available.applied_for_fund.description',
            icon: 'fund_applied',
            closeBtnText: 'modal.buttons.confirm',
        }, {
            onClose: () => {
                if (typeof $dir.onApply === 'function') {
                    $dir.onApply();
                }
            }
        });
    }

    const failOfficesCheck = () => {
        return ModalService.open('modalNotification', {
            type: 'danger',
            title: 'provider_funds.available.error_apply.title',
            description: $filter('i18n')('provider_funds.available.error_apply.description')
        });
    }

    $dir.$onInit = () => {
        setFilterData();
        checkOffices();

        $scope.$watch('$dir.selected', updateHasSelected, true);
        $scope.$watch('$dir.needReload', (newVal) => {
            if (newVal) $dir.onPageChange();
        });
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            organization: '=',
            funds: '=',
            needReload: '=',
            onApply: '&',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            'ProviderFundService',
            'ModalService',
            'PushNotificationsService',
            'OfficeService',
            '$scope',
            '$filter',
            '$q',
            ProviderAvailableFundsTableDirective
        ],
        templateUrl: 'assets/tpl/directives/provider-available-funds-table.html'
    };
};