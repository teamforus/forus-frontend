let FinancialDashboardOverviewComponent = function(
    appConfigs,
    FundService,
    ModalService,
    OrganizationService,
    FileService
) {
    const $ctrl = this;
    const org = OrganizationService.active();

    $ctrl.filters = {
        values: {
            q: "",
            per_page: 15,
            state: 'approved_or_has_transactions',
        },
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

    $ctrl.$onInit = function() {
        if (Array.isArray($ctrl.funds.data)) {
            $ctrl.funds.data = $ctrl.funds.data.filter(function(fund) {
                return fund.state !== 'waiting';
            });

            $ctrl.budgetFunds = $ctrl.funds.data.filter(function(fund) {
                return fund.type === 'budget';
            });
        }

        $ctrl.transformFunds();
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
};

module.exports = {
    bindings: {
        fund: '<',
        funds: '<',
        state: '<',
    },
    controller: [
        'appConfigs',
        'FundService',
        'ModalService',
        'OrganizationService',
        'FileService',
        FinancialDashboardOverviewComponent
    ],
    templateUrl: 'assets/tpl/pages/financial-dashboard-overview.html'
};