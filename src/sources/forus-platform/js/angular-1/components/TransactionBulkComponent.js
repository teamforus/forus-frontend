const TransactionBulkComponent = function(
    $q,
    $state,
    appConfigs,
    ModalService,
    TransactionService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.resettingBulk = false;
    $ctrl.approvingBulk = false;

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
            });
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.appConfigs = appConfigs;

        $ctrl.transactionBulk.transactions = $ctrl.transactionBulk.transactions.map((transaction) => {
            const ui_sref = ({
                address: transaction.address,
                organization_id: $ctrl.organization.id,
            });

            return { ...transaction, ui_sref };
        });
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
        'PushNotificationsService',
        TransactionBulkComponent
    ],
    templateUrl: 'assets/tpl/pages/transaction-bulk.html'
};