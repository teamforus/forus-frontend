const TransactionsComponent = function(
    $state,
    $timeout,
    appConfigs,
    FileService,
    ModalService,
    TransactionService,
    OrganizationService
) {
    const $ctrl = this;
    const org = OrganizationService.active();

    $ctrl.empty = null;

    $ctrl.viewTypes = [{
        key: 'transactions',
        label: 'Transactions',
    }, {
        key: 'bulks',
        label: 'Bulks',
    }];

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

    $ctrl.statesKeyValue = $ctrl.states.reduce((obj, item) => {
        return { ...obj, [item.key]: item.name };
    }, {});

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

    $ctrl.bulkFilters = {
        values: {},
        valuesDefault: { per_page: 20 },
        reset: () => $ctrl.bulkFilters.values = { ...$ctrl.bulkFilters.valuesDefault }
    };

    $ctrl.resetFilters = () => {
        $ctrl.filters.reset();
    };

    $ctrl.hideFilters = () => {
        $timeout(() => {
            $ctrl.filters.show = false;
        }, 0);
    };

    $ctrl.fetchBulks = (query) => {
        return TransactionService.listBulks($ctrl.organization.id, query);
    };

    $ctrl.fetchTransactions = (query) => {
        return TransactionService.list(appConfigs.panel_type, $ctrl.organization.id, query);
    };

    $ctrl.setViewType = (viewType) => {
        $ctrl.viewType = viewType;

        if ($ctrl.viewType.key == 'bulks') {
            $ctrl.bulkFilters.reset();
        } else {
            $ctrl.filters.reset();
        }
    };

    $ctrl.onBulkPageChange = (query) => {
        $ctrl.fetchBulks(query).then(((res) => {
            const data = res.data.data.map((transactionBulk) => {
                const ui_sref = {
                    organization_id: $ctrl.organization.id,
                    id: transactionBulk.id
                };

                return { ...transactionBulk, ui_sref };
            });

            $ctrl.transactionBulks = { ...res.data, data };
        }));
    };

    $ctrl.onPageChange = (query) => {
        $ctrl.fetchTransactions(query).then((res => {
            const data = res.data.data.map((transaction) => {
                const ui_sref = ({
                    address: transaction.address,
                    organization_id: $ctrl.organization.id,
                });

                const ui_sref_bulk = {
                    organization_id: $ctrl.organization.id,
                    id: transaction.voucher_transaction_bulk_id
                };

                return { ...transaction, ui_sref, ui_sref_bulk };
            });

            $ctrl.transactions = { ...res.data, data };
            $ctrl.transactionsTotal = res.data.meta.total_amount;
        }));
    };

    // Export to XLS file
    $ctrl.exportList = () => {
        ModalService.open('exportType', {
            success: (data) => {
                const filters = { ...$ctrl.filters.values, ...{ export_format: data.exportType } };
                const fileName = appConfigs.panel_type + '_' + org + '_' + moment().format('YYYY-MM-DD HH:mm:ss') + '.' + data.exportType;

                TransactionService.export(appConfigs.panel_type, $ctrl.organization.id, filters).then((res) => {
                    FileService.downloadFile(fileName, res.data, res.headers('Content-Type') + ';charset=utf-8;');
                }, console.error);
            }
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.isSponsor = appConfigs.panel_type == 'sponsor';
        $ctrl.viewType = $ctrl.viewTypes[0];

        $ctrl.filters.reset();
        $ctrl.onPageChange($ctrl.filters.values);

        if ($ctrl.isSponsor) {
            $ctrl.bulkFilters.reset();
            $ctrl.onBulkPageChange($ctrl.bulkFilters.values);
        }
    };
};

module.exports = {
    bindings: {
        organization: '<',
    },
    controller: [
        '$state',
        '$timeout',
        'appConfigs',
        'FileService',
        'ModalService',
        'TransactionService',
        'OrganizationService',
        TransactionsComponent
    ],
    templateUrl: 'assets/tpl/pages/transactions.html'
};