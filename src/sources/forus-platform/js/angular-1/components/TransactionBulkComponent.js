const TransactionBulkComponent = function(
    $q,
    $state,
    appConfigs,
    ModalService,
    TransactionService,
    PageLoadingBarService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.resettingBulk = false;
    $ctrl.approvingBulk = false;

    $ctrl.filters = {
        per_page: 20,
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

    $ctrl.confirmReset = () => {
        return $ctrl.confirmDangerAction('Reset bulk!', [
            'You declined previous bulk payment request.',
            'This will reset the status of the bulk, and send a new draft payment to your mobile app.',
            'Are you sure you want to continue?',
        ].join("\n"));
    }

    $ctrl.resetPaymentRequest = (transactionBulk) => {
        $ctrl.approvingBulk = true;

        $ctrl.confirmReset().then((confirmed) => {
            if (!confirmed) {
                return $ctrl.approvingBulk = false;
            }

            $ctrl.resettingBulk = true;
            PageLoadingBarService.setProgress(0);

            TransactionService.bulkReset($ctrl.organization.id, transactionBulk.id).then((res) => {
                PushNotificationsService.success(
                    `Success!`,
                    `Please approve the transactions in your banking app.`
                );
            }, (res) => {
                PushNotificationsService.danger('Error!', res.data.message || 'Something went wrong!');
            }).finally(() => {
                $ctrl.resettingBulk = false;
                $state.reload();
                PageLoadingBarService.setProgress(100);
            });
        });
    };

    $ctrl.fetchTransactions = (query) => {
        return $q((resolve, reject) => {
            PageLoadingBarService.setProgress(0);
            TransactionService.list(appConfigs.panel_type, $ctrl.organization.id, query).then(resolve, reject);
        }).finally(() => PageLoadingBarService.setProgress(100));
    };

    $ctrl.onPageChange = (query) => {
        $ctrl.fetchTransactions(query).then((res => {
            const data = res.data.data.map((transaction) => {
                const ui_sref = ({
                    address: transaction.address,
                    organization_id: $ctrl.organization.id,
                });

                return { ...transaction, ui_sref };
            });

            $ctrl.transactions = { ...res.data, data };
            $ctrl.transactionsTotal = res.data.meta.total_amount;
        }));
    };

    $ctrl.$onInit = () => {
        $ctrl.appConfigs = appConfigs;
        $ctrl.filters.voucher_transaction_bulk_id = $ctrl.transactionBulk.id;

        $ctrl.onPageChange($ctrl.filters);
    };
};

module.exports = {
    bindings: {
        organization: '<',
        transactionBulk: '<',
    },
    controller: [
        '$q',
        '$state',
        'appConfigs',
        'ModalService',
        'TransactionService',
        'PageLoadingBarService',
        'PushNotificationsService',
        TransactionBulkComponent
    ],
    templateUrl: 'assets/tpl/pages/transaction-bulk.html'
};