let sprintf = require('sprintf-js').sprintf;

let TransactionsComponent = function(
    $state,
    $timeout,
    appConfigs,
    FileService,
    TransactionService,
    OrganizationService
) {
    let $ctrl = this;

    let org = OrganizationService.active();

    $ctrl.empty = null;

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

    $ctrl.fundStates = [{
        key: null,
        name: 'Alle'
    }, {
        key: 'closed',
        name: 'Gesloten'
    }, {
        key: 'active',
        name: 'Actief'
    }];

    $ctrl.filters = {
        show: false,
        values: {},
        reset: function() {
            this.values.q = '';
            this.values.state = $ctrl.states[0].key;
            this.values.fund_state = $ctrl.fundStates[0].key;
            this.values.from = null;
            this.values.to = null;
            this.values.amount_min = null;
            this.values.amount_max = null;
        }
    };

    $ctrl.statesKeyValue = $ctrl.states.reduce((obj, item) => {
        obj[item.key] = item.name;
        return obj;
    }, {});

    $ctrl.resetFilters = () => {
        $ctrl.filters.reset();
    };

    $ctrl.hideFilters = () => {
        $timeout(() => {
            $ctrl.filters.show = false;
        }, 0);
    };

    // Export to XLS file
    $ctrl.exportList = () => {
        TransactionService.export(
            appConfigs.panel_type,
            $ctrl.organization.id,
            $ctrl.filters.values
        ).then((res => {
            let timestamp = appConfigs.disable_file_name_timestamps ? 
                '_' + moment().format('YYYY-MM-DD HH:mm:ss') : '';

            FileService.downloadFile(
                sprintf("%s_%s%s.xls", appConfigs.panel_type, org, timestamp),
                res.data,
                res.headers('Content-Type') + ';charset=utf-8;'
            );
        }));
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
            
            $ctrl.transactionsTotal = res.data.meta.total_amount;
        }));
    };

    $ctrl.init = async () => {
        $ctrl.filters.reset();
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
        '$timeout',
        'appConfigs',
        'FileService',
        'TransactionService',
        'OrganizationService',
        TransactionsComponent
    ],
    templateUrl: 'assets/tpl/pages/transactions.html'
};