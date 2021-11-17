const TransactionsComponent = function(
    $q,
    $state,
    $timeout,
    appConfigs,
    FileService,
    ModalService,
    $stateParams,
    TransactionService,
    OrganizationService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;
    const org = OrganizationService.active();

    $ctrl.empty = null;
    $ctrl.buildingBulks = false;
    $ctrl.pendingBulkingTotal = 0;

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
            this.values.per_page = 20;
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
        return $ctrl.confirmDangerAction('Confirmation!', [
            'The bulk payments are usually generated once a day.',
            'This will generate them immediately and send a draft payment to your mobile app.',
            'Are you sure you want to continue?',
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
                        'Success!',
                        `${bulks.length} bulk(s) where created, please approve the transactions in your banking app.`
                    );
                } else if (bulks.length == 1) {
                    $state.go('transaction-bulk', {
                        organization_id: $ctrl.organization.id,
                        id: bulks[0].id
                    });

                    PushNotificationsService.success(
                        `Success!`,
                        `Please approve the transactions in your banking app.`
                    );
                }
            }, (res) => {
                PushNotificationsService.danger('Error!', res.data.message || 'Something went wrong!')
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
        '$timeout',
        'appConfigs',
        'FileService',
        'ModalService',
        '$stateParams',
        'TransactionService',
        'OrganizationService',
        'PageLoadingBarService',
        'PushNotificationsService',
        TransactionsComponent
    ],
    templateUrl: 'assets/tpl/pages/transactions.html'
};