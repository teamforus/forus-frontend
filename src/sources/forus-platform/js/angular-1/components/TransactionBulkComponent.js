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