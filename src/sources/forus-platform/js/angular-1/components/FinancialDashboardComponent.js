let FinancialDashboardComponent = function(
    $state,
    $scope,
    $stateParams,
    FundService
) {
    let $ctrl = this;

    $ctrl.chartData = {
        request: {
            type: "all",
            nth: moment().month() + 1,
            year: moment().year(),
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
            if (this.request.type == 'week') {
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
            if (this.request.type == 'week') {
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
                stringTitle = 'Totaal';
            }

            this.stringTitle = stringTitle;
        },
        update: function () {
            this.updateTitle();

            if (!$ctrl.fund) {
                return;
            }

            FundService.readFinances(
                $ctrl.fund.organization_id,
                $ctrl.fund.id,
                $ctrl.chartData.request
            ).then(function (res) {
                $ctrl.chartData.response = res.data;
            });
        }
    };

    $ctrl.$onInit = function () {

        if (Array.isArray($ctrl.funds)) {

            $ctrl.funds = $ctrl.funds.filter(function(fund) {
                return fund.state !== 'waiting';
            });

            if($ctrl.funds.length == 1 && !$ctrl.fund){
                $state.go('financial-dashboard', {
                    organization_id: $ctrl.funds[0].organization_id,
                    fund_id: $ctrl.funds[0].id
                });
            }

            $ctrl.funds.forEach((fund, index, funds) => {
                fund.fundCategories = _.pluck(fund.product_categories, 'name').join(', ');
            });
        }

        $ctrl.emptyBlockLink = $state.href('funds-create', $stateParams);

        $ctrl.chartData.update();

        if (Array.isArray($ctrl.fundProviders)) {
            $ctrl.fundProviders = $ctrl.fundProviders.map(fundProvider => {
                fundProvider.organization.fundCategories = fundProvider.organization.product_categories.map(category => {
                    return category.name;
                });

                return fundProvider;
            });
        }

        if ($ctrl.fund) {
            $ctrl.fund.fundCategories = _.pluck($ctrl.fund.product_categories, 'name').join(', ');
        }
    };

    $scope.onPageChange = async (query) => {
        FundService.listProviders(
            $ctrl.fund.organization_id,
            $ctrl.fund.id,
            'approved',
            query
        ).then((res => {
            $ctrl.fundProviders = res.data;
        }));
    };
};

module.exports = {
    bindings: {
        fund: '<',
        funds: '<',
        fundProviders: '<'
    },
    controller: [
        '$state',
        '$scope',
        '$stateParams',
        'FundService',
        FinancialDashboardComponent
    ],
    templateUrl: 'assets/tpl/pages/financial-dashboard.html'
};