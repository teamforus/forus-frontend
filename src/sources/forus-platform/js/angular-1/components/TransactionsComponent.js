let FileSaver = require('file-saver');

let TransactionsComponent = function(
    $state,
    $scope,
    OrganizationService,
    appConfigs,
    TransactionService
) {
    let $ctrl = this;

    var now = moment().format('YYYY-MM-DD HH:mm');
    var org = OrganizationService.active();

    $ctrl.states = {
        pending: 'In afwachting',
        success: 'Voltooid'
    };

    // Export to CSV file
    $ctrl.exportList = function(e) {
        e && (e.preventDefault() & e.stopPropagation());

        var data = $ctrl.transactions.data.map(function(row) {
            return {
                date: row.created_at,
                amount: row.amount,
                fund: row.fund.name,
                provider: row.organization.name,
                state: $ctrl.states[row.state],
                payment_id: row.payment_id,
            };
        });

        var file_name = appConfigs.panel_type + '-' + org;
        var file_type = 'text/csv;charset=utf-8;';
        var file_data = Papa.unparse(data);

        var blob = new Blob([file_data], {
            type: file_type,
        });

        FileSaver.saveAs(blob, file_name + '-transactions-' + now + '.csv');
    };

    $ctrl.showTransaction = (transaction) => {
        $state.go('transaction', appConfigs.panel_type == 'sponsor' ? {
            address: transaction.address,
            organization_id: transaction.fund.organization_id
        } : transaction);
    };

    $scope.onPageChange = async (query) => {
        TransactionService.list(
            appConfigs.panel_type,
            $ctrl.organization.id,
            query
        ).then((res => {
            $ctrl.transactions = res.data;
        }));
    };
};

module.exports = {
    bindings: {
        transactions: '<',
        organization: '<'
    },
    controller: [
        '$state',
        '$scope',
        'OrganizationService',
        'appConfigs',
        'TransactionService',
        TransactionsComponent
    ],
    templateUrl: 'assets/tpl/pages/transactions.html'
};