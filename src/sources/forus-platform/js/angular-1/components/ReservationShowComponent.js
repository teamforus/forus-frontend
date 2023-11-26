const ReservationShowComponent = function (
    appConfigs,
    TransactionService,
    PushNotificationsService,
    ProductReservationService,
) {
    const $ctrl = this;

    $ctrl.acceptReservation = (reservation) => {
        ProductReservationService.confirmApproval(reservation, () => {
            ProductReservationService.accept($ctrl.organization.id, reservation.id).then((res) => {
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.reservation = res.data.data;

                if ($ctrl.reservation.voucher_transaction?.address) {
                    $ctrl.fetchTransaction($ctrl.reservation.voucher_transaction?.address);
                }
            }, (res) => PushNotificationsService.danger(res.data.message));
        });
    }

    $ctrl.rejectReservation = (reservation) => {
        if (reservation.extra_payment?.is_paid && !reservation.extra_payment?.is_fully_refunded) {
            return ProductReservationService.showRejectInfoExtraPaid();
        }

        ProductReservationService.confirmRejection(() => {
            ProductReservationService.reject($ctrl.organization.id, reservation.id).then((res) => {
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.reservation = res.data.data;
            }, (res) => PushNotificationsService.danger(res.data.message));
        });
    }

    $ctrl.fetchReservation = (reservation_id) => {
        ProductReservationService.read($ctrl.organization.id, reservation_id).then((res) => {
            $ctrl.reservation = res.data.data;
        }, (res) => PushNotificationsService.danger(res.data.message));
    }

    $ctrl.fetchTransaction = (transaction_address) => {
        TransactionService.show(appConfigs.panel_type, $ctrl.organization.id, transaction_address).then((res) => {
            $ctrl.transaction = res.data.data;
        });
    }

    $ctrl.onTransactionUpdate = () => {
        $ctrl.fetchReservation($ctrl.reservation.id);
    };

    $ctrl.$onInit = () => {
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
        }[$ctrl.reservation.state] || 'label-default';
    };
};

module.exports = {
    bindings: {
        reservation: '<',
        organization: '<',
    },
    controller: [
        'appConfigs',
        'TransactionService',
        'PushNotificationsService',
        'ProductReservationService',
        ReservationShowComponent,
    ],
    templateUrl: 'assets/tpl/pages/reservation-show.html',
};