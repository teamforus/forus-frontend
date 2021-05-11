let FinancialDashboardOverviewComponent = function(
    appConfigs,
    FundService,
    ModalService,
    OrganizationService,
    FileService
) {
    const $ctrl = this;
    const org = OrganizationService.active();

    $ctrl.transformFunds = () => {
        $ctrl.budgetFunds.forEach(fund => {
            fund.collapsedData = false;

            fund.budget.percentageTotal = $ctrl.fundsFinancialOverview.vouchers_amount > 0 ? 
                Math.round(fund.budget.vouchers_amount / $ctrl.fundsFinancialOverview.vouchers_amount * 100) : 0;

            fund.budget.percentageActive = $ctrl.fundsFinancialOverview.vouchers_active > 0 ? 
                Math.round(fund.budget.active_vouchers_amount / $ctrl.fundsFinancialOverview.vouchers_active * 100) : 0;

            fund.budget.percentageInactive = $ctrl.fundsFinancialOverview.vouchers_inactive > 0 ? 
                Math.round(fund.budget.inactive_vouchers_amount / $ctrl.fundsFinancialOverview.vouchers_inactive * 100) : 0;

            fund.budget.percentageUsed = $ctrl.fundsFinancialOverview.used > 0 ? 
                Math.round(fund.budget.used / $ctrl.fundsFinancialOverview.used * 100) : 0;

            fund.budget.percentageLeft = $ctrl.fundsFinancialOverview.left > 0 ? 
                Math.round(fund.budget.left / $ctrl.fundsFinancialOverview.left * 100) : 0;

            fund.budget.averagePerVoucher = fund.budget.vouchers_count ? fund.budget.vouchers_amount / fund.budget.vouchers_count : 0;
        });
    };

    $ctrl.exportFunds = (detailed) => {
        ModalService.open('exportType', {
            success: (data) => {
                FundService.financialOverviewExport($ctrl.organization.id, {
                    export_type: data.exportType,
                    detailed: detailed ? 1 : 0
                }).then((res => {
                    const dateTime = moment().format('YYYY-MM-DD HH:mm:ss');

                    const fileData = res.data;
                    const fileType = res.headers('Content-Type') + ';charset=utf-8;';
                    const fileName = appConfigs.panel_type + '_' + org + '_' + dateTime + '.' + data.exportType;

                    FileService.downloadFile(fileName, fileData, fileType);
                }), console.error);
            }
        });
    };

    $ctrl.$onInit = function() {
        $ctrl.funds.data = $ctrl.funds.data.filter((fund) => (fund.state == 'active'));
        $ctrl.budgetFunds = $ctrl.funds.data.filter((fund) => fund.type == 'budget');
        $ctrl.transformFunds();
    };
};

module.exports = {
    bindings: {
        funds: '<',
        organization: '<',
        fundsFinancialOverview: '<',
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