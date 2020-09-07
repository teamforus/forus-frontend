let FundsComponent = function(
    $state,
    $stateParams,
    appConfigs,
    FundService,
    FormBuilderService
) {
    let $ctrl = this;

    if (!appConfigs.features || !appConfigs.features.funds.list) {
        return $state.go('home');
    }

    $ctrl.recordsByKey = {};
    $ctrl.recordsByTypesKey = {};
    $ctrl.appConfigs = appConfigs;

    $ctrl.filtersList = [
        'q', 'organization_id'
    ];

    $ctrl.objectOnly = (obj, props = []) => {
        let out = {};

        for (const prop in obj) {
            if (obj.hasOwnProperty(prop) && props.indexOf(prop) != -1) {
                out[prop] = obj[prop];
            }
        }

        return out;
    };

    $ctrl.toggleMobileMenu = () => {
        $ctrl.showModalFilters ? $ctrl.hideMobileMenu() : $ctrl.showMobileMenu()
    };

    $ctrl.showMobileMenu = () => {
        $ctrl.showModalFilters = true;
        $ctrl.updateState($ctrl.buildQuery($ctrl.form.values));
    };

    $ctrl.hideMobileMenu = () => {
        $ctrl.showModalFilters = false;
        $ctrl.updateState($ctrl.buildQuery($ctrl.form.values));
    };

    $ctrl.cancel = () => {
        if (typeof($ctrl.modal.scope.cancel) === 'function') {
            $ctrl.modal.scope.cancel();
        }

        $ctrl.close();
    };

    $ctrl.showAs = (display_type) => {
        $ctrl.display_type = display_type;
        $ctrl.updateState($ctrl.buildQuery($ctrl.form.values));
    };

    $ctrl.buildQuery = (values) => ({
        q: values.q,
        page: values.page,
        organization_id: values.organization_id,
        display_type: $ctrl.display_type,
    });

    $ctrl.updateState = (query, location = 'replace') => {
        $state.go('funds', {
            q: query.q || '',
            page: query.page,
            display_type: query.display_type,
            organization_id: query.organization_id,
            show_menu: $ctrl.showModalFilters,
        });
    };

    $ctrl.onFormChange = (values) => {
        if (timeout) {
            $timeout.cancel(timeout);
        }

        timeout = $timeout(() => {
            $ctrl.onPageChange(values);
        }, 1000);
    };

    $ctrl.loadFunds = (query, location = 'replace') => {
        FundService.list(null, Object.assign(query, {
            per_page: 10
        })).then(res => {
            $ctrl.funds = res.data;
        });

        $ctrl.updateState(query, location);
        $ctrl.updateFiltersUsedCount();
    };

    $ctrl.updateFiltersUsedCount = () => {
        $ctrl.countFiltersApplied = Object.values(
            $ctrl.objectOnly($ctrl.form.values, $ctrl.filtersList)
        ).reduce((count, filter) => count + (filter ? (
            typeof filter == 'object' ? (filter.id ? 1 : 0) : 1
        ) : 0), 0);
    };

    $ctrl.onPageChange = (values) => {
        $ctrl.loadFunds($ctrl.buildQuery(values));
    };

    $ctrl.$onInit = function() {
        if (Array.isArray($ctrl.records)) {
            $ctrl.records.forEach(function(record) {
                if (!$ctrl.recordsByKey[record.key]) {
                    $ctrl.recordsByKey[record.key] = [];
                }
    
                $ctrl.recordsByKey[record.key].push(record);
            });
        }

        $ctrl.recordTypes.forEach(function(recordType) {
            $ctrl.recordsByTypesKey[recordType.key] = recordType;
        });

        $ctrl.funds.data = $ctrl.funds.data.map(function(fund) {
            fund.vouchers = $ctrl.vouchers.filter(voucher => {
                return voucher.fund_id == fund.id;
            });

            fund.isApplicable = fund.criteria.filter(
                criterion => criterion.is_valid
            ).length == fund.criteria.length;

            fund.alreadyReceived = fund.vouchers.length !== 0;

            fund.criterioaList = FundService.fundCriteriaList(
                fund.criteria,
                $ctrl.recordsByTypesKey
            );

            fund.voucherStateName = 'vouchers';
            if (fund.vouchers[0] && fund.vouchers[0].address) {
                fund.voucherStateName = 'voucher({ address: fund.vouchers[0].address })';
            }

            return fund;
        });

        $ctrl.organizations = Object.values($ctrl.funds.meta.organizations);

        $ctrl.organizations.unshift({
            id: null,
            name: 'Alle organisaties',
        });

        $ctrl.form = FormBuilderService.build({
            q: $stateParams.q || '',
            organization_id: $stateParams.organization_id || null
        });

        $ctrl.applyFund = function(fund) {
            FundService.apply(fund.id).then(function(res) {
                $state.go('voucher', res.data.data);
            }, console.error);
        };

        $ctrl.showModalFilters = $stateParams.show_menu;
        $ctrl.display_type = $stateParams.display_type;
        $ctrl.updateFiltersUsedCount();
    };
};

module.exports = {
    bindings: {
        funds: '<',
        records: '<',
        vouchers: '<',
        recordTypes: '<',
    },
    controller: [
        '$state',
        '$stateParams',
        'appConfigs',
        'FundService',
        'FormBuilderService',
        FundsComponent
    ],
    templateUrl: 'assets/tpl/pages/funds.html'
};