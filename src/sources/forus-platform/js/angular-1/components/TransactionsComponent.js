let TransactionsComponent = function(
    $state,
    $scope,
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

    $ctrl.filters = {
        show: false,
        values: {},
        reset: function() {
            this.values.state = $ctrl.states[0].key;
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

    // Export to XLS file
    $ctrl.exportList = () => {
        TransactionService.export(
            appConfigs.panel_type,
            $ctrl.organization.id,
            $ctrl.filters.values
        ).then((res => {
            FileService.downloadFile(
                appConfigs.panel_type + '_' + org + '_' + moment().format(
                    'YYYY-MM-DD HH:mm:ss'
                ) + '.xls',
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
        '$scope',
        'appConfigs',
        'FileService',
        'TransactionService',
        'OrganizationService',
        TransactionsComponent
    ],
    templateUrl: 'assets/tpl/pages/transactions.html'
};