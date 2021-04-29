let FinancialDashboardComponent = function(
    $state,
    $stateParams,
    FundService,
    OrganizationService,
    FileService
) {
    const $ctrl = this;
    const startYear = 2015;

    $ctrl.field = 'amount';

    $ctrl.fetchData = (query = {}) => {
        $ctrl.chartData.update();
        $ctrl.getFinancePerProvider(query);
    };

    $ctrl.timeFilters = {
        type: 'year',
        years: [],
        makeYears: function() {
            return [...(new Array(moment().year() - startYear)).keys()].map((years) => {
                const date = moment().subtract(years, 'year');

                return {
                    label: date.format('YYYY'),
                    value: date.format('YYYY'),
                    from: date.clone().startOf('year').format('YYYY-MM-DD'),
                    to: date.clone().endOf('year').format('YYYY-MM-DD'),
                };
            });;
        },
        init: function() {
            this.years = this.makeYears();
            this.years.reverse();
            this.year = this.years[this.years.length - 1];
        },
        setFilter: function(value, type) {
            this[type || this.type] = value;
            this.updateFilter();
        },
        updateFilter: function() {
            $ctrl.fetchData();
        },
        getQuery: function() {
            return {
                type: this.type,
                type_value: {
                    year: this.year.value,
                }[this.type],
                from: {
                    year: this.year.from,
                }[this.type],
                to: {
                    year: this.year.to,
                }[this.type],
            };
        }
    };

    $ctrl.timeFilters.init();

    $ctrl.filters = {
        values: {
            q: "",
            per_page: 15,
            state: 'approved_or_has_transactions',
        },
    };

    $ctrl.selections = {
        funds: {
            type: 'funds',
            ids: null,
            items: [],
            names: 'Alle fondsen',
            noSelection: 'Alle fondsen'
        },
        providerOrganizations: {
            type: 'providerOrganizations',
            ids: null,
            items: [],
            names: 'Alle aanbieders',
            noSelection: 'Alle aanbieders'
        },
        postcodes: {
            type: 'postcodes',
            ids: null,
            items: [],
            names: 'Alle postcodes',
            noSelection: 'Alle postcodes'
        },
        /* productCategories: {
            type: 'productCategories',
            ids: null,
            items: [],
            names: 'Alle categories',
            noSelection: 'Alle categories'
        } */
    }

    $ctrl.shownDropdownType = null;

    $ctrl.onClickOutsideDropdown = () => {
        $ctrl.shownDropdownType = null;
    }

    $ctrl.showDropdown = (e, type) => {
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();

        $ctrl.shownDropdownType = type;
    }

    $ctrl.getQuery = () => {
        return {
            fund_ids: $ctrl.selections.funds.ids,
            postcodes: $ctrl.selections.postcodes.items.map(item => item.name),
            provider_ids: $ctrl.selections.providerOrganizations.ids,
            /* product_category_ids: $ctrl.selections.productCategories.ids, */
        };
    }

    $ctrl.getFinancePerProvider = (query) => {
        OrganizationService.financeProviders(
            $ctrl.organization.id,
            { ...$ctrl.chartData.getQuery(), ...query }
        ).then(res => {
            $ctrl.providerOrganizationsFinances = res.data;
        });
    }

    $ctrl.financeProvidersExport = () => {
        OrganizationService.financeProvidersExport(
            $ctrl.organization.id, $ctrl.chartData.getQuery()
        ).then((res => {
            FileService.downloadFile(
                'financial-dashboard_' + $ctrl.organization.name + '_' + moment().format(
                    'YYYY-MM-DD HH:mm:ss'
                ) + '.xls',
                res.data,
                res.headers('Content-Type') + ';charset=utf-8;'
            );
        }));
    }

    $ctrl.getSelectAllOption = (type) => $ctrl[type].filter(item => item.id == null)[0];
    $ctrl.getItemOptions = (type) => $ctrl[type].filter(item => item.id != null);

    $ctrl.resetSelection = (type) => {
        $ctrl.getSelectAllOption(type).checked = true;;
        $ctrl.selectOption(type, $ctrl.getSelectAllOption(type));
    }

    $ctrl.selectOption = (type, selectedItem, fetchData = true) => {
        const optionAll = $ctrl.getSelectAllOption(type);
        const optionItems = $ctrl.getItemOptions(type);

        //- Select all options if 'all' 
        if (selectedItem.id == null) {
            optionItems.forEach(item => item.checked = selectedItem.checked);
        }

        optionAll.checked = optionItems.filter(item => item.checked).length === optionItems.length;

        const selectedItems = optionAll.checked ? null : optionItems.filter(item => item.checked);

        $ctrl.selections[type]['items'] = selectedItems ? selectedItems : [];
        $ctrl.selections[type]['names'] = selectedItems ? selectedItems.map(item => item.name).join(', ') : $ctrl.selections[type]['noSelection'];
        $ctrl.selections[type]['ids'] = selectedItems ? selectedItems.map(item => item.id) : null;

        if (fetchData) {
            $ctrl.fetchData();
        }
    };

    $ctrl.$onInit = function() {
        $ctrl.emptyBlockLink = $state.href('funds-create', $stateParams);

        $ctrl.chartData = {
            request: {
                year: moment().year(),
                product_category: null,
            },
            response: {},
            changeType: function(type) {
                this.request.type = type;

                if (this.request.type == 'week') {
                    this.request.nth = moment().week();
                } else if (this.request.type == 'month') {
                    this.request.nth = moment().month() + 1;
                } else if (this.request.type == 'quarter') {
                    this.request.nth = moment().quarter();
                } else if (this.request.type == 'all') {
                    this.request.nth = null;
                }

                this.update();
            },
            increase: function() {
                if (this.request.type == 'all') {
                    this.request.year++;
                } else if (this.request.type == 'week') {
                    if (this.request.nth == moment().year(this.request.year).weeksInYear()) {
                        this.request.nth = 1;
                        this.request.year++;
                    } else {
                        this.request.nth++;
                    }
                } else if (this.request.type == 'month') {
                    if (this.request.nth == 12) {
                        this.request.nth = 1;
                        this.request.year++;
                    } else {
                        this.request.nth++;
                    }
                } else if (this.request.type == 'quarter') {
                    if (this.request.nth == 4) {
                        this.request.nth = 1;
                        this.request.year++;
                    } else {
                        this.request.nth++;
                    }
                }

                this.update();
            },
            decrease: function() {
                if (this.request.type == 'all') {
                    this.request.year--;
                } else if (this.request.type == 'week') {
                    if (this.request.nth == 1) {
                        this.request.year--;
                        this.request.nth = moment().year(this.request.year).weeksInYear();
                    } else {
                        this.request.nth--;
                    }
                } else if (this.request.type == 'month') {
                    if (this.request.nth == 1) {
                        this.request.nth = 12;
                        this.request.year--;
                    } else {
                        this.request.nth--;
                    }
                } else if (this.request.type == 'quarter') {
                    if (this.request.nth == 1) {
                        this.request.nth = 4;
                        this.request.year--;
                    } else {
                        this.request.nth--;
                    }
                }

                this.update();
            },
            getQuery: function() {
                return { ...$ctrl.chartData.request, ...$ctrl.getQuery(), ...$ctrl.timeFilters.getQuery() };
            },
            update: function() {
                FundService.readFinances($ctrl.organization.id, this.getQuery()).then((res) => {
                    $ctrl.chartData.response = res.data;
                });
            }
        };

        $ctrl.postcodes.sort();

        $ctrl.funds.unshift({
            name: 'Alle fondsen',
            id: null,
            checked: true
        });

        $ctrl.providerOrganizations.unshift({
            name: 'Alle aanbieders',
            id: null,
            checked: true
        });

        $ctrl.postcodes.unshift({
            name: 'Alle postcodes',
            id: null,
            checked: true
        });

        /* $ctrl.productCategories.unshift({
            name: 'Alle categories',
            id: null,
            checked: true
        }); */

        $ctrl.selectOption('funds', $ctrl.funds[0], false);
        $ctrl.selectOption('postcodes', $ctrl.postcodes[0], false);
        // $ctrl.selectOption('productCategories', $ctrl.productCategories[0]);
        $ctrl.selectOption('providerOrganizations', $ctrl.providerOrganizations[0], false);

        $ctrl.fetchData();
    };
};

module.exports = {
    bindings: {
        funds: '<',
        postcodes: '<',
        fundProviders: '<',
        organization: '<',
        // productCategories: '<',
        providerOrganizations: '<'
    },
    controller: [
        '$state',
        '$stateParams',
        'FundService',
        'OrganizationService',
        'FileService',
        FinancialDashboardComponent
    ],
    templateUrl: 'assets/tpl/pages/financial-dashboard.html'
};