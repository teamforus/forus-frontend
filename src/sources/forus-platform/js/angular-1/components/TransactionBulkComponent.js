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

    $ctrl.confirmDangerAction = (title, description, cancelButton = 'Annuleren', confirmButton = 'Bevestigen') => {
        return $q((resolve) => {
            ModalService.open("dangerZone", {
                ...{ title, description, cancelButton, confirmButton },
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false),
            });
        });
    }

    $ctrl.confirmReset = () => {
        return $ctrl.confirmDangerAction('Bulktransactie opnieuw versturen', [
            'U staat op het punt om een bulktransactie opnieuw te versturen. De vorige bulkbetaling was geannuleerd. Het opnieuw versturen stelt de bulktransactie opnieuw in en stuurt de transactie naar uw mobiele app.',
            'Weet u zeker dat u wilt verdergaan?',            
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
                    `Succes!`,
                    `Accepteer de transacties in de mobiele app van bunq.`
                );
            }, (res) => {
                PushNotificationsService.danger('Error!', res.data.message || 'Er ging iets mis!');
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