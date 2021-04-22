let FinancialDashboardComponent = function(
    $state,
    $scope,
    $q,
    $stateParams,
    appConfigs,
    OrganizationService,
    FundService,
    DateService,
    ModalService,
    FileService
) {
    let $ctrl = this;

    let org = OrganizationService.active();

    $ctrl.filters = {
        values: {
            q: "",
            per_page: 15,
            state: 'approved_or_has_transactions',
        },
    };

    $ctrl.onFundSelect = (fund) => {
        $ctrl.fund = fund;

        $ctrl.startYear = DateService._dateParseYmd(
            $ctrl.fund.start_date
        ).year();
        $ctrl.chartData.request.year = $ctrl.startYear;

        $ctrl.getProviders($ctrl.filters.values).then(providers => {
            $ctrl.allFundProviders = providers;
            $ctrl.chartData.update();
        });
    }; 

    $ctrl.getProviders = (query) => {
        let deferred = $q.defer();
        
        FundService.listProviders(
            $ctrl.fund.organization_id,
            $ctrl.fund.id,
            'approved_or_has_transactions',
            query
        ).then(res => {
            deferred.resolve($ctrl.fundProviders = res.data);
        }, deferred.reject);

        return deferred.promise;
    }

    $ctrl.$onInit = function() {
        $ctrl.startYear = $ctrl.fund ? DateService._dateParseYmd(
            $ctrl.fund.start_date
        ).year() : null;

        $ctrl.chartData = {
            request: {
                type: "all",
                nth: moment().month() + 1,
                year: moment().year(),
                product_category: null,
                year: $ctrl.startYear,
            },
            response: {},
            stringTitle: "",
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
            updateTitle: function() {
                let stringTitle = "";

                if (this.request.type == 'week') {
                    stringTitle = this.request.nth + ' Week ' + this.request.year;
                } else if (this.request.type == 'month') {
                    stringTitle = moment.months(this.request.nth - 1) + ' ' + this.request.year;
                } else if (this.request.type == 'quarter') {
                    stringTitle = 'Kwartaal: Q' + this.request.nth + ' ' + this.request.year;
                } else if (this.request.type == 'all') {
                    stringTitle = 'Jaar ' + this.request.year;
                }

                this.stringTitle = stringTitle;
            },
            update: function() {
                this.updateTitle();

                if (!$ctrl.fund) {
                    return;
                }

                FundService.readFinances(
                    $ctrl.fund.organization_id,
                    $ctrl.fund.id,
                    $ctrl.chartData.request
                ).then(function(res) {
                    $ctrl.chartData.response = res.data;
                });
            }
        };

        if (Array.isArray($ctrl.funds.data)) {
            $ctrl.funds.data = $ctrl.funds.data.filter(function(fund) {
                return fund.state !== 'waiting';
            });

            $ctrl.budgetFunds = $ctrl.funds.data.filter(function(fund) {
                return fund.type === 'budget';
            });

            if ($ctrl.funds.meta.total == 1 && !$ctrl.fund) {
                return $state.go('financial-dashboard-statistics', {
                    organization_id: $ctrl.funds.data[0].organization_id,
                    fund_id: $ctrl.funds.data[0].id,
                });
            }
        }

        $ctrl.transformFunds();

        $ctrl.state = $stateParams.state;

        $ctrl.emptyBlockLink = $state.href('funds-create', $stateParams);

        $ctrl.chartData.update();

        if (Array.isArray($ctrl.fundProviders)) {
            $ctrl.fundProviders = $ctrl.fundProviders;
        }

        $ctrl.productCategories.unshift({
            name: 'Alle',
            id: null
        });

        $ctrl.productCategories.push({
            name: 'Anders',
            id: -1
        });
    };

    $ctrl.transformFunds = () => {
        if (!$ctrl.budgetFunds.length) {
            return;
        }

        $ctrl.budgetFunds.forEach(fund => {
            fund.collapsedData = false;

            fund.budget.percentageTotal = $ctrl.funds.meta.vouchers_amount > 0 ? 
                Math.round(fund.budget.vouchers_amount / $ctrl.funds.meta.vouchers_amount * 100) : 0;

            fund.budget.percentageActive = $ctrl.funds.meta.vouchers_active > 0 ? 
                Math.round(fund.budget.active_vouchers_amount / $ctrl.funds.meta.vouchers_active * 100) : 0;

            fund.budget.percentageInactive = $ctrl.funds.meta.vouchers_inactive > 0 ? 
                Math.round(fund.budget.inactive_vouchers_amount / $ctrl.funds.meta.vouchers_inactive * 100) : 0;

            fund.budget.percentageUsed = $ctrl.funds.meta.used > 0 ? 
                Math.round(fund.budget.used / $ctrl.funds.meta.used * 100) : 0;

            fund.budget.percentageLeft = $ctrl.funds.meta.left > 0 ? 
                Math.round(fund.budget.left / $ctrl.funds.meta.left * 100) : 0;

            fund.budget.averagePerVoucher = fund.budget.vouchers_count ? fund.budget.vouchers_amount / fund.budget.vouchers_count : 0;
        });

        return $ctrl.funds;
    };

    $ctrl.exportFunds = (detailed) => {
        ModalService.open('exportType', {
            success: (data) => {
                FundService.export(
                    $ctrl.funds.data[0].organization_id,
                    Object.assign($ctrl.filters.values, {
                        export_type: data.exportType,
                        detailed: detailed ? 1 : 0
                    })
                ).then((res => {
                    FileService.downloadFile(
                        appConfigs.panel_type + '_' + org + '_' + moment().format(
                            'YYYY-MM-DD HH:mm:ss'
                        ) + '.' + data.exportType,
                        res.data,
                        res.headers('Content-Type') + ';charset=utf-8;'
                    );
                }), console.error);
            }
        });
    };

    $scope.onPageChange = (query) => {
        $ctrl.getProviders(query);
    };
};

module.exports = {
    bindings: {
        fund: '<',
        funds: '<',
        state: '<',
        fundProviders: '<',
        productCategories: "<",
    },
    controller: [
        '$state',
        '$scope',
        '$q',
        '$stateParams',
        'appConfigs',
        'OrganizationService',
        'FundService',
        'DateService',
        'ModalService',
        'FileService',
        FinancialDashboardComponent
    ],
    templateUrl: 'assets/tpl/pages/financial-dashboard.html'
};