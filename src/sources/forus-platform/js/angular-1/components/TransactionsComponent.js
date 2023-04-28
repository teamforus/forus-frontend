const TransactionsComponent = function(
    $q,
    $state,
    $filter,
    appConfigs,
    ModalService,
    $stateParams,
    TransactionService,
    TransactionsExportService,
    TransactionBulkService,
    TransactionBulksExportService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;
    const $currencyFormat = $filter('currency_format');

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

    $ctrl.bulkStates = [{
        key: null,
        name: 'Alle'
    }, {
        key: 'draft',
        name: 'Draft'
    }, {
        key: 'error',
        name: 'Fout'
    }, {
        key: 'pending',
        name: 'In behandeling'
    }, {
        key: 'accepted',
        name: 'Geaccepteerd'
    }, {
        key: 'rejected',
        name: 'Geweigerd'
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
        values: {
            q: $stateParams.q,
            state: $stateParams.state,
            fund_id: $stateParams.fund_id,
            fund_state: $stateParams.fund_state,
            from: $stateParams.from,
            to: $stateParams.to,
            amount_min: $stateParams.amount_min,
            amount_max: $stateParams.amount_max,
            page: $stateParams.page,
            per_page: 20,
            order_by: $stateParams.order_by,
            order_dir: $stateParams.order_dir,
        },
        valuesDefault: {
            q: '',
            state: $ctrl.states[0].key,
            fund_id: null,
            fund_state: $ctrl.fundStates[0].key,
            from: null,
            to: null,
            amount_min: null,
            amount_max: null,
            per_page: 20,
            order_by: 'created_at',
            order_dir: 'desc',
        },
        reset: () => { 
            $ctrl.filters.values = { ...$ctrl.filters.valuesDefault };
            $ctrl.updateState($ctrl.filters.valuesDefault, true);
        }
    };

    $ctrl.bulkFilters = {
        values: {
            from: $stateParams.from,
            to: $stateParams.to,
            amount_min: $stateParams.amount_min,
            amount_max: $stateParams.amount_max,
            quantity_min: $stateParams.quantity_min,
            quantity_max: $stateParams.quantity_max,
            state: $stateParams.state,
            per_page: 20,
            page: $stateParams.page,
            order_by: $stateParams.order_by,
            order_dir: $stateParams.order_dir,
        },
        valuesDefault: {
            from: null,
            to: null,
            amount_min: null,
            amount_max: null,
            quantity_min: null,
            quantity_max: null,
            state: $ctrl.bulkStates[0].key,
            per_page: 20,
            order_by: 'created_at',
            order_dir: 'desc',
        },
        reset: () => { 
            $ctrl.bulkFilters.values = { ...$ctrl.bulkFilters.valuesDefault };
            $ctrl.updateState($ctrl.bulkFilters.valuesDefault, true);
        }
    };

    $ctrl.resetFilters = () => {
        $ctrl.filters.reset();
    };

    $ctrl.hideFilters = () => {
        $ctrl.filters.show = false;
    };

    $ctrl.hideBulkFilters = () => {
        $ctrl.bulkFilters.show = false;
    };

    $ctrl.fetchBulks = (query) => {
        return $q((resolve, reject) => {
            PageLoadingBarService.setProgress(0);
            TransactionBulkService.list($ctrl.organization.id, query).then(resolve, reject);
        }).finally(() => PageLoadingBarService.setProgress(100));
    };

    $ctrl.fetchTransactions = (query) => {
        return $q((resolve, reject) => {
            PageLoadingBarService.setProgress(0);
            TransactionService.list(appConfigs.panel_type, $ctrl.organization.id, query).then(resolve, reject);
        }).finally(() => PageLoadingBarService.setProgress(100));
    };

    $ctrl.setViewType = (viewType) => {
        $ctrl.viewType = viewType;

        if ($ctrl.viewType.key == 'bulks') {
            $ctrl.filters.reset();
        } else {
            $ctrl.bulkFilters.reset();
        }

        $state.transitionTo($state.$current.name, {
            organization_id: $ctrl.organization.id,
            type: $ctrl.viewType.key
        }, {
            notify: false,
            location: 'replace',
            reload: false,
        });
    };

    $ctrl.confirmDangerAction = (title, description_text, cancelButton = 'Annuleren', confirmButton = 'Bevestigen') => {
        return $q((resolve) => {
            ModalService.open("dangerZone", {
                ...{ title, description_text, cancelButton, confirmButton, text_align: 'center' },
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false),
            });
        });
    }

    $ctrl.confirmBulkNow = () => {
        const total = $ctrl.pendingBulkingMeta.total;
        const totalAmount = $currencyFormat($ctrl.pendingBulkingMeta.total_amount);

        return $ctrl.confirmDangerAction('Nu een bulktransactie maken', [
            'U staat op het punt om een bulktransactie aan te maken. De nog niet uitbetaalde transacties worden gebundeld tot één bulktransactie.',
            `De ${total} individuele transacties hebben een totaal waarde van ${totalAmount}.`,
            'Weet u zeker dat u wilt verdergaan?',
        ].join("\n"));
    }

    $ctrl.bulkPendingNow = () => {
        $ctrl.confirmBulkNow().then((confirmed) => {
            if (!confirmed) {
                return;
            }

            $ctrl.buildingBulks = true;
            PageLoadingBarService.setProgress(0);

            TransactionBulkService.bulkNow($ctrl.organization.id, $ctrl.filters.values).then((res) => {
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
                PageLoadingBarService.setProgress(100);
            });
        });
    };

    let mapTransactionBulks = (bulkTransactions) => {
        const data = bulkTransactions.data.map((transactionBulk) => {
            const ui_sref = {
                organization_id: $ctrl.organization.id,
                id: transactionBulk.id
            };

            return { ...transactionBulk, ui_sref };
        });

        $ctrl.transactionBulks = { ...bulkTransactions, data };
    };

    $ctrl.onBulkPageChange = (query) => {
        $ctrl.fetchBulks(query).then(((res) => {
            mapTransactionBulks(res.data);

            $ctrl.updateState(query, true);
        }));
    };

    $ctrl.updateState = (query, location = 'replace') => {
        $state.go('transactions', {
            type: $ctrl.viewType.key,
            q: query.q || '',
            page: query.page,
            state: query.state,
            fund_id: query.fund_id,
            fund_state: query.fund_state,
            from: query.from,
            to: query.to,
            amount_min: query.amount_min,
            amount_max: query.amount_max,
            quantity_min: query.quantity_min,
            quantity_max: query.quantity_max,
            organization_id: $ctrl.organization.id,
            order_by: query.order_by,
            order_by_dir: query.order_by_dir,
        }, { location });
    };

    const mapTransactions = (transactions) => {
        const data = transactions.data.map((transaction) => {
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

        $ctrl.transactions = { ...transactions, data };
        $ctrl.transactionsTotal = transactions.meta.total_amount;

        if ($ctrl.isSponsor && $ctrl.organization.has_bank_connection) {
            $ctrl.updateHasPendingBulking();
        }
    }; 

    $ctrl.onPageChange = (query) => {
        $ctrl.fetchTransactions(query).then((res => {
            mapTransactions(res.data);

            $ctrl.updateState(query, true);
        }));
    };

    $ctrl.exportTransactions = () => {
        $ctrl.hideFilters()

        TransactionsExportService.export($ctrl.organization.id, {
            ...$ctrl.filters.values, per_page: undefined,
        });
    };

    $ctrl.exportTransactionBulks = () => {
        $ctrl.hideBulkFilters()

        TransactionBulksExportService.export($ctrl.organization.id, {
            ...$ctrl.bulkFilters.values, per_page: undefined,
        });
    };

    $ctrl.updateHasPendingBulking = () => {
        $ctrl.fetchTransactions({
            ...$ctrl.filters.values,
            pending_bulking: 1,
            per_page: 1,
        }).then((res) => $ctrl.pendingBulkingMeta = res.data.meta);
    };

    $ctrl.uploadTransactions = () => {
        ModalService.open('voucherTransactionsUpload', {
            organization: $ctrl.organization,
            onCreated: () => $ctrl.onPageChange(),
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.isSponsor = appConfigs.panel_type == 'sponsor';
        $ctrl.viewType = $ctrl.viewTypes.filter(type => type.key == $stateParams.type)[0] || $ctrl.viewTypes[0];
        $ctrl.hasDirectPayments = $ctrl.funds.filter((fund) => fund.allow_direct_payments).length > 0;

        $ctrl.funds.unshift({
            id: null,
            name: 'Selecteer fond'
        });

        mapTransactions($ctrl.transactions);

        if ($ctrl.isSponsor) {
            mapTransactionBulks($ctrl.transactionBulks);

            if ($ctrl.organization.has_bank_connection) {
                $ctrl.updateHasPendingBulking();
            }
        }
    };
};

module.exports = {
    bindings: {
        organization: '<',
        funds: '<',
        transactions: '<',
        transactionBulks: '<',
    },
    controller: [
        '$q',
        '$state',
        '$filter',
        'appConfigs',
        'ModalService',
        '$stateParams',
        'TransactionService',
        'TransactionsExportService',
        'TransactionBulkService',
        'TransactionBulksExportService',
        'PageLoadingBarService',
        'PushNotificationsService',
        TransactionsComponent
    ],
    templateUrl: 'assets/tpl/pages/transactions.html'
};