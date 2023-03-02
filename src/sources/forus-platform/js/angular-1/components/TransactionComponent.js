const TransactionComponent = function() {
    const $ctrl = this;

    $ctrl.$onInit = function() {};
};

module.exports = {
    bindings: {
        organization: '<',
        transaction: '<',
    },
    controller: [
        TransactionComponent
    ],
    templateUrl: 'assets/tpl/pages/transaction.html'
};