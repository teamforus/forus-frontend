let FinancialDashboardTransactionComponent = function(
    $state, 
    TransactionService
) {
    let $ctrl = this;

    $ctrl.$onInit = function () {
        console.log($ctrl.voucherTransction);
    };
};

module.exports = {
    bindings: {
        fund: '<',
        fundProvider: '<',
        voucherTransction: '<',
    },
    controller: [
        '$state', 
        'TransactionService', 
        FinancialDashboardTransactionComponent
    ],
    templateUrl: 'assets/tpl/pages/financial-dashboard-transaction.html'
};