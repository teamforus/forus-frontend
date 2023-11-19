const ReservationExtraPaymentShowComponent = function (
    appConfigs,
    TransactionService,
) {
    const $ctrl = this;

    $ctrl.fetchTransaction = (transaction_address) => {
        TransactionService.show(appConfigs.panel_type, $ctrl.organization.id, transaction_address).then((res) => {
            $ctrl.transaction = res.data.data;
        });
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
        ReservationExtraPaymentShowComponent,
    ],
    templateUrl: 'assets/tpl/pages/reservation-extra-payment-show.html',
};