const TransactionBulkComponent = function(appConfigs) {
    const $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.appConfigs = appConfigs;

        $ctrl.transactionBulk.transactions = $ctrl.transactionBulk.transactions.map((transaction) => {
            const ui_sref = ({
                address: transaction.address,
                organization_id: $ctrl.organization.id,
            });

            return { ...transaction, ui_sref };
        });
    };
};

module.exports = {
    bindings: {
        organization: '<',
        transactionBulk: '<',
    },
    controller: [
        'appConfigs',
        TransactionBulkComponent
    ],
    templateUrl: 'assets/tpl/pages/transaction-bulk.html'
};