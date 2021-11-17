const TransactionsComponent = function(
    $q,
    $state,
    $timeout,
    appConfigs,
    FileService,
    ModalService,
    TransactionService,
    OrganizationService,
    PushNotificationsService,
) {
    const $ctrl = this;
    const org = OrganizationService.active();

    $ctrl.empty = null;
    $ctrl.buildingBulks = false;
    $ctrl.pendingBulkingTotal = 0;

    $ctrl.viewTypes = [{
        key: 'transactions',
        label: 'Individueel',
    }, {
        key: 'bulks',
        label: 'Bulk',
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

    $ctrl.confirmDangerAction = (title, description, cancelButton = 'Cancel', confirmButton = 'Confirm') => {
        return $q((resolve) => {
            ModalService.open("dangerZone", {
                ...{ title, description, cancelButton, confirmButton },
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false),
            });
        });
    }

    $ctrl.confirmBulkNow = () => {
        return $ctrl.confirmDangerAction('Nu een bulktransactie maken', [
            'U staat op het punt om een bulktransactie aan te maken. De nog niet uitbetaalde transacties worden gebundeld tot één bulktransactie.',
            'De [amount of transactions in bulk] individuele transacties hebben een totaal waarde van [ total sum € of transaction in bulk ].',
            'Weet u zeker dat u wilt verdergaan?',
        ].join("\n"));
    }

    $ctrl.bulkPendingNow = () => {
        $ctrl.confirmBulkNow().then((confirmed) => {
            if (!confirmed) {
                return;
            }

            $ctrl.buildingBulks = true;

            TransactionService.bulkNow($ctrl.organization.id).then((res) => {
                const bulks = res.data.data;
    
                if (bulks.length > 1) {
                    $ctrl.setViewType($ctrl.viewTypes.filter((viewType) => viewType.key == 'bulks')[0]);
                    $ctrl.onBulkPageChange($ctrl.bulkFilters.values);
    
                    PushNotificationsService.success(
                        'Succes!',
                        `${bulks.length} bulktransactie(s) aangemaakt. Accepteer de transactie in uw mobiele app van bunq.`
                    );
                } else if (bulks.length == 1) {
                    $state.go('transaction-bulk', {
                        organization_id: $ctrl.organization.id,
                        id: bulks[0].id
                    });
    
                    PushNotificationsService.success(
                        `Succes!`,
                        `Accepteer de transactie in uw mobiele app van bunq.`
                    );
                }
            }, (res) => {
                PushNotificationsService.danger('Error!', res.data.message || 'Er ging iets mis!')
            }).finally(() => {
                $ctrl.buildingBulks = false;
                $ctrl.updateHasPendingBulking();
            });
        });
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

    $ctrl.updateHasPendingBulking = () => {
        $ctrl.fetchTransactions({
            pending_bulking: 1,
            per_page: 1,
        }).then((res) => {
            $ctrl.pendingBulkingTotal = res.data.meta.total;
        })
    };

    $ctrl.$onInit = () => {
        $ctrl.isSponsor = appConfigs.panel_type == 'sponsor';
        $ctrl.viewType = $ctrl.viewTypes[0];

        $ctrl.filters.reset();
        $ctrl.onPageChange($ctrl.filters.values);

        if ($ctrl.isSponsor) {
            $ctrl.bulkFilters.reset();
            $ctrl.onBulkPageChange($ctrl.bulkFilters.values);
            $ctrl.updateHasPendingBulking();
        }
    };
};

module.exports = {
    bindings: {
        organization: '<',
    },
    controller: [
        '$q',
        '$state',
        '$timeout',
        'appConfigs',
        'FileService',
        'ModalService',
        'TransactionService',
        'OrganizationService',
        'PushNotificationsService',
        TransactionsComponent
    ],
    templateUrl: 'assets/tpl/pages/transactions.html'
};