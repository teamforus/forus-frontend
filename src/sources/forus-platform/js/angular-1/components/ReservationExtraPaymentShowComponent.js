const ReservationExtraPaymentShowComponent = function (
    appConfigs,
    TransactionService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.fetchTransaction = (transaction_address) => {
        PageLoadingBarService.setProgress(0);

        TransactionService
            .show(appConfigs.panel_type, $ctrl.organization.id, transaction_address)
            .then(
                (res) => $ctrl.transaction = res.data.data,
                (res) => PushNotificationsService.danger('Error!', res?.data?.message || 'Unknown error.'),
            )
            .finally(() => PageLoadingBarService.setProgress(100));
    }

    $ctrl.$onInit = () => {
        $ctrl.reservation = $ctrl.extraPayment.reservation;

        if ($ctrl.reservation.voucher_transaction?.address) {
            $ctrl.fetchTransaction($ctrl.reservation.voucher_transaction.address);
        }

        $ctrl.stateClass = {
            waiting: 'label-default',
            pending: 'label-default',
            accepted: 'label-success',
            rejected: 'label-danger',
            canceled: 'label-danger',
            canceled_by_client: 'label-danger',
            canceled_payment_expired: 'label-danger',
            canceled_payment_canceled: 'label-danger',
        }[$ctrl.reservation.state];
    };
};

module.exports = {
    bindings: {
        extraPayment: '<',
        organization: '<',
    },
    controller: [
        'appConfigs',
        'TransactionService',
        'PageLoadingBarService',
        'PushNotificationsService',
        ReservationExtraPaymentShowComponent,
    ],
    templateUrl: 'assets/tpl/pages/reservation-extra-payment-show.html',
};