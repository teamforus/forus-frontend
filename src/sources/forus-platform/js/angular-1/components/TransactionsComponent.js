const TransactionsComponent = function(
    $q,
    $state,
    $filter,
    $timeout,
    appConfigs,
    FileService,
    ModalService,
    $stateParams,
    TransactionService,
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
        valuesDefault: {
            q: '',
            state: $ctrl.states[0].key,
            fund_state: $ctrl.fundStates[0].key,
            from: null,
            to: null,
            amount_min: null,
            amount_max: null,
            per_page: 20,
            order_by: 'created_at',
            order_dir: 'desc',
        },
        reset: () => $ctrl.filters.values = { ...$ctrl.filters.valuesDefault }
    };

    $ctrl.bulkFilters = {
        values: {},
        valuesDefault: {
            per_page: 20,
            order_by: 'created_at',
            order_dir: 'desc',
        },
        reset: () => $ctrl.bulkFilters.values = { ...$ctrl.bulkFilters.valuesDefault }
    };

    $ctrl.resetFilters = () => {
        $ctrl.filters.reset();
    };

    $ctrl.hideFilters = () => {
        $timeout(() => $ctrl.filters.show = false, 0);
    };

    $ctrl.fetchBulks = (query) => {
        return $q((resolve, reject) => {
            PageLoadingBarService.setProgress(0);
            TransactionService.listBulks($ctrl.organization.id, query).then(resolve, reject);
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
            $ctrl.bulkFilters.reset();
        } else {
            $ctrl.filters.reset();
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
                PageLoadingBarService.setProgress(100);
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

                const fileName = [
                    appConfigs.panel_type,
                    $ctrl.organization.id,
                    moment().format('YYYY-MM-DD HH:mm:ss') + '.' + data.exportType
                ].join('_');

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
        }).then((res) => $ctrl.pendingBulkingMeta = res.data.meta);
    };

    $ctrl.$onInit = () => {
        $ctrl.isSponsor = appConfigs.panel_type == 'sponsor';
        $ctrl.viewType = $ctrl.viewTypes.filter(type => type.key == $stateParams.type)[0] || $ctrl.viewTypes[0];

        $ctrl.filters.reset();
        $ctrl.onPageChange($ctrl.filters.values);

        if ($ctrl.isSponsor) {
            $ctrl.bulkFilters.reset();
            $ctrl.onBulkPageChange($ctrl.bulkFilters.values);

            if ($ctrl.organization.has_bank_connection) {
                $ctrl.updateHasPendingBulking();
            }
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
        '$filter',
        '$timeout',
        'appConfigs',
        'FileService',
        'ModalService',
        '$stateParams',
        'TransactionService',
        'PageLoadingBarService',
        'PushNotificationsService',
        TransactionsComponent
    ],
    templateUrl: 'assets/tpl/pages/transactions.html'
};