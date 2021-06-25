const ReservationCardDirective = function(
    $scope,
    ModalService,
    PushNotificationsService,
    ProductReservationService
) {
    const reservation = $scope.reservation;
    const product = reservation.product;
    const media = product.photo || product.logo || null;

    const cancelReservation = (reservation) => {
        ModalService.open('modalProductReserveCancel', {
            reservation: reservation,
            onConfirm: () => {
                ProductReservationService.destroy(reservation.id).finally(() => {
                    $scope.onDelete({ reservation })
                    PushNotificationsService.success('Reservation canceled.');
                }, (res) => PushNotificationsService.danger('Error.', res.data.message));
            },
        });
    }

    $scope.$dir = { reservation, product, media, cancelReservation };
};

module.exports = () => {
    return {
        scope: {
            reservation: '=',
            onDelete: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'ModalService',
            'PushNotificationsService',
            'ProductReservationService',
            ReservationCardDirective
        ],
        templateUrl: 'assets/tpl/directives/reservation-card.html'
    };
};