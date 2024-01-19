const ReservationShowComponent = function (
    appConfigs,
    TransactionService,
    PageLoadingBarService,
    PushNotificationsService,
    ProductReservationService,
) {
    const $ctrl = this;

    $ctrl.updateReservationFlags = () => {
        $ctrl.stateClass = {
            waiting: 'label-default',
            pending: 'label-default',
            accepted: 'label-success',
            rejected: 'label-danger',
            canceled: 'label-danger',
            canceled_by_client: 'label-danger',
            canceled_payment_expired: 'label-danger',
            canceled_payment_canceled: 'label-danger',
        }[$ctrl.reservation?.state] || 'label-default';
    };

    $ctrl.acceptReservation = (reservation) => {
        ProductReservationService.confirmApproval(reservation, () => {
            PageLoadingBarService.setProgress(0);

            ProductReservationService.accept($ctrl.organization.id, reservation.id).then((res) => {
                PushNotificationsService.success('Opgeslagen!');

                $ctrl.reservation = res.data.data;
                $ctrl.updateReservationFlags();

                if ($ctrl.reservation.voucher_transaction?.address) {
                    $ctrl.fetchTransaction($ctrl.reservation.voucher_transaction?.address);
                }
            }, (res) => {
                PushNotificationsService.danger('Error.', res.data.message);
            }).then(() => PageLoadingBarService.setProgress(100));
        });
    };

    $ctrl.rejectReservation = (reservation) => {
        if (reservation.extra_payment?.is_paid && !reservation.extra_payment?.is_fully_refunded) {
            return ProductReservationService.showRejectInfoExtraPaid();
        }

        ProductReservationService.confirmRejection(() => {
            ProductReservationService.reject($ctrl.organization.id, reservation.id).then((res) => {
                PushNotificationsService.success('Opgeslagen!');

                $ctrl.reservation = res.data.data;
                $ctrl.updateReservationFlags();
            }, (res) => {
                PushNotificationsService.danger('Error.', res.data.message);
            }).then(() => PageLoadingBarService.setProgress(100));
        });
    };

    $ctrl.fetchReservation = (reservation_id) => {
        ProductReservationService.read($ctrl.organization.id, reservation_id).then((res) => {
            $ctrl.reservation = res.data.data;
            $ctrl.updateReservationFlags();
        }, (res) => {
            PushNotificationsService.danger('Error.', res.data.message);
        }).then(() => PageLoadingBarService.setProgress(100));
    };

    $ctrl.fetchTransaction = (transaction_address) => {
        TransactionService.show(appConfigs.panel_type, $ctrl.organization.id, transaction_address).then(
            (res) => $ctrl.transaction = res.data.data,
            (res) => PushNotificationsService.danger('Error.', res.data.message),
        ).then(() => PageLoadingBarService.setProgress(100));
    };

    $ctrl.onTransactionUpdate = () => {
        $ctrl.fetchReservation($ctrl.reservation.id);
    };

    $ctrl.onExtraPaymentUpdate = () => {
        $ctrl.fetchReservation($ctrl.reservation.id);

        if ($ctrl.reservation.voucher_transaction?.address) {
            $ctrl.fetchTransaction($ctrl.reservation.voucher_transaction.address);
        }
    };

    $ctrl.$onInit = () => {
        $ctrl.updateReservationFlags();

        if ($ctrl.reservation.voucher_transaction?.address) {
            $ctrl.fetchTransaction($ctrl.reservation.voucher_transaction.address);
        }
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
        'PageLoadingBarService',
        'PushNotificationsService',
        'ProductReservationService',
        ReservationShowComponent,
    ],
    templateUrl: 'assets/tpl/pages/reservation-show.html',
};