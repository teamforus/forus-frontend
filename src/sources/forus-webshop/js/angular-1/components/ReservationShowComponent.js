const ReservationShowComponent = function (
    ModalService,
    PageLoadingBarService,
    PushNotificationsService,
    ProductReservationService,
) {
    const $ctrl = this;

    $ctrl.payExtraReservation = () => {
        PageLoadingBarService.setProgress(0);

        ProductReservationService.checkoutExtra($ctrl.reservation.id).then(
            (res) => document.location.href = res.data.url,
            (res) => PushNotificationsService.danger('Error.', res.data.message),
        ).finally(() => PageLoadingBarService.setProgress(100));
    };

    $ctrl.cancelReservation = () => {
        ModalService.open('modalProductReserveCancel', {
            reservation: $ctrl.reservation,
            onConfirm: () => {
                PageLoadingBarService.setProgress(0);

                ProductReservationService.cancel($ctrl.reservation.id, {
                    state: 'canceled_by_client',
                }).then(
                    (res) => {
                        $ctrl.reservation = res.data.data;
                        $ctrl.$onInit();
                        PushNotificationsService.success('Reservering geannuleerd.');
                    },
                    (res) => PushNotificationsService.danger('Error.', res.data.message),
                ).finally(() => PageLoadingBarService.setProgress(100));
            },
        });
    };

    $ctrl.$onInit = function () {
        $ctrl.product = $ctrl.reservation.product;
        $ctrl.media = $ctrl.product.photo || $ctrl.product.logo || null;

        $ctrl.stateData = ProductReservationService.composeStateAndExpires($ctrl.reservation);
    };
};

module.exports = {
    bindings: {
        reservation: '<',
    },
    controller: [
        'ModalService',
        'PageLoadingBarService',
        'PushNotificationsService',
        'ProductReservationService',
        ReservationShowComponent,
    ],
    templateUrl: 'assets/tpl/pages/reservation-show.html',
};