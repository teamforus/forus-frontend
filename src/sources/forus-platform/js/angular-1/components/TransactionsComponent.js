let TransactionsComponent = function(
    $state, 
    TransactionService
) {
    let $ctrl = this;
};

module.exports = {
    controller: [
        '$state', 
        'TransactionService', 
        TransactionsComponent
    ],
    templateUrl: 'assets/tpl/pages/transactions.html'
};