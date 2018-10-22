let TransactionsComponent = function(
    $state, 
    TransactionService
) {
    let $ctrl = this;

};

module.exports = {
    bindings: {
        transactions: '<'
    },
    controller: [
        '$state', 
        'TransactionService', 
        TransactionsComponent
    ],
    templateUrl: 'assets/tpl/pages/transactions.html'
};