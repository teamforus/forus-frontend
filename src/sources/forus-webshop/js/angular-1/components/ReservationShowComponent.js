const ReservationShowComponent = function (
    ModalService,
    PushNotificationsService,
    ProductReservationService,
) {
    const $ctrl = this;

    $ctrl.payExtraReservation = () => {
        ProductReservationService.payExtra($ctrl.reservation.id).then((res) => {
            document.location.href = res.data.url
        }, (res) => PushNotificationsService.danger('Error.', res.data.message));
    };

    $ctrl.cancelReservation = () => {
        ModalService.open('modalProductReserveCancel', {
            reservation: $ctrl.reservation,
            onConfirm: () => {
                ProductReservationService.update($ctrl.reservation.id, {
                    state: 'canceled_by_client',
                }).then((res) => {
                    $ctrl.reservation = res.data.data;
                    $ctrl.$onInit();
                    PushNotificationsService.success('Reservering geannuleerd.');
                }, (res) => PushNotificationsService.danger('Error.', res.data.message));
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
        'PushNotificationsService',
        'ProductReservationService',
        ReservationShowComponent,
    ],
    templateUrl: 'assets/tpl/pages/reservation.html',
};