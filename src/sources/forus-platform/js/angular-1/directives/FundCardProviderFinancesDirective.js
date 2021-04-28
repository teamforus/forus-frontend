let FundCardProviderFinancesDirective = function(
    $scope, 
    $state,
    FundService,
    FileService,
    OrganizationService
) {
    let now = moment().format('YYYY-MM-DD HH:mm');
    let org = OrganizationService.active();

    $scope.one = 1;
    $scope.chartData = {
        request: {
            type: "year",
            nth: moment().month() + 1,
            year: moment().year(),
            product_category: null,
        },
        response: {},
        stringTitle: "",
        changeType: function (type) {
            this.request.type = type;
            $scope.allowDataIncrement = true;

            if (this.request.type == 'week') {
                this.request.nth = moment().week();
            } else if (this.request.type == 'month') {
                this.request.nth = moment().month() + 1;
            } else if (this.request.type == 'quarter') {
                this.request.nth = moment().quarter();
            } else if (this.request.type == 'year') {
                this.request.nth = null;
            }

            this.update();
        },
        increase: function () {
            if (this.request.type == 'year') {
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
        decrease: function () {
            if (this.request.type == 'year') {
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
        updateTitle: function () {
            let stringTitle = "";

            if (this.request.type == 'week') {
                stringTitle = this.request.nth + ' Week ' + this.request.year;
            } else if (this.request.type == 'month') {
                stringTitle = moment.months(this.request.nth - 1) + ' ' + this.request.year;
            } else if (this.request.type == 'quarter') {
                stringTitle = 'Kwartaal: Q' + this.request.nth + ' ' + this.request.year;
            } else if (this.request.type == 'year') {
                stringTitle = 'Jaar ' + this.request.year;
            }

            this.stringTitle = stringTitle;
        },
        update: function () {
            this.updateTitle();
            $scope.allowDataIncrement = $scope.allowChartDataIncrement();

            FundService.readProvidersFinances(
                $scope.fundProvider.fund.organization_id,
                $scope.fundProvider.fund.id,
                $scope.fundProvider.id,
                $scope.chartData.request
            ).then(function (res) {
                $scope.chartData.response = res.data;

                if ($scope.chartData.request.type == 'year') {
                    $scope.chartData.response.dates.map((date, index) => {
                        date.key = 'Kwartaal ' + (index + 1);
                        return date;
                    });
                }
            });
        }
    };

    $scope.allowChartDataIncrement = () => {
        return $scope.chartData.request.type != 'year' || 
            $scope.chartData.request.year != moment().year() ;
    }

    $scope.allowDataIncrement = $scope.allowChartDataIncrement();

    $scope.states = [{
        key: null,
        name: 'Alle'
    }, {
        key: 'pending',
        name: 'In afwachting'
    }, {
        key: 'success',
        name: 'Voltooid'
    }];

    $scope.filters = {
        show: false,
        values: {},
        reset: function() {
            this.values.state = $scope.states[0].key;
            this.values.from = null;
            this.values.to = null;
            this.values.amount_min = null;
            this.values.amount_max = null;
        }
    };

    $scope.statesKeyValue = $scope.states.reduce((obj, item) => {
        obj[item.key] = item.name;
        return obj;
    }, {});

    $scope.hideFilters = () => {
        $scope.$apply(function() {
            $scope.filters.show = false;
        });
    };

    $scope.fund = $scope.fundProvider.fund;

    $scope.productCategories = _.clone([]);
    $scope.productCategories.unshift({
        name: 'Alle',
        id: null
    });

    $scope.productCategories.push({
        name: 'Anders',
        id: -1
    });

    // Export to XLS file
    $scope.exportList = () => {
        FundService.exportProvidersTransactions(
            $scope.fundProvider.fund.organization_id,
            $scope.fundProvider.fund.id,
            $scope.fundProvider.id,
            $scope.filters.values
        ).then((res => {
            FileService.downloadFile(
                'financial-dashboard_' + org + '_' + moment().format(
                    'YYYY-MM-DD HH:mm:ss'
                ) + '.xls',
                res.data,
                res.headers('Content-Type') + ';charset=utf-8;'
            );
        }));
    };

    $scope.showTransaction = (transaction) => {
        $state.go('transaction', {
            address: transaction.address,
            organization_id: transaction.fund.organization_id
        });
    };

    $scope.toggleDetails = function(type) {
        if (type == 'transactions') {
            $scope.filters.reset();

            FundService.readProvidersTransactions(
                $scope.fundProvider.fund.organization_id,
                $scope.fundProvider.fund.id,
                $scope.fundProvider.id
            ).then(function (res) {
                $scope.fundProvider.showStatistics = false;
                $scope.fundProvider.showTransactions = true;
                $scope.transactions = res.data;
            });
        } else {
            $scope.chartData.update();
            $scope.fundProvider.showStatistics = true;
            $scope.fundProvider.showTransactions = false;
        }
    };

    $scope.onPageChange = async (query) => {
        FundService.readProvidersTransactions(
            $scope.fundProvider.fund.organization_id,
            $scope.fundProvider.fund.id,
            $scope.fundProvider.id,
            query
        ).then(function (res) {
            $scope.transactions = res.data;
        });
    };
};

module.exports = () => {
    return {
        scope: {
            fundProvider: '='
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            'FundService',
            'FileService',
            'OrganizationService',
            FundCardProviderFinancesDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-card-provider-finances.html' 
    };
};
