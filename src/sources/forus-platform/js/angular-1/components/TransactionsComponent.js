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

    $ctrl.empty = null;

    $ctrl.filters = {
        show: false,
        values: {},
    };

    $ctrl.states = [{
        key: null,
        name: 'Alle'
    }, {
        key: 'pending',
        name: 'In afwachting'
    }, {
        key: 'success',
        name: 'Voltooid'
    }];

    $ctrl.statesKeyValue = $ctrl.states.reduce((obj, item) => {
        obj[item.key] = item.name; 
        return obj;
    }, {});

    $ctrl.resetFilters = () => {
        $ctrl.filters.values.q = '';
        $ctrl.filters.values.state = $ctrl.states[0].key;
        $ctrl.filters.values.from = null;
        $ctrl.filters.values.to = null;
    };

    $ctrl.hideFilters = () => {
        $scope.$apply(function() { 
            $ctrl.filters.show = false;
        });
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

    $ctrl.onPageChange = (query) => {
        TransactionService.list(
            appConfigs.panel_type,
            $ctrl.organization.id,
            query
        ).then((res => {
            $ctrl.transactions = res.data;

            if ($ctrl.empty === null) {
                $ctrl.empty = res.data.meta.total == 0;
            }
        }));
    };

    $ctrl.init = async () => {
        $ctrl.resetFilters();
        $ctrl.onPageChange($ctrl.filters.values);
    };

    $ctrl.$onInit = () => {
        $ctrl.init();
    };
};

module.exports = {
    bindings: {
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