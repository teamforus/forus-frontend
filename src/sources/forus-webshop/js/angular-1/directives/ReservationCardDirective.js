const ReservationCardDirective = function (
    $scope,
    ModalService,
    PushNotificationsService,
    ProductReservationService,
) {
    const { $dir } = $scope;

    $dir.$onInit = () => {
        $dir.product = $dir.reservation.product;
        $dir.media =  $dir.product.photo ||  $dir.product.logo || null;

        $dir.cancelReservation = (reservation) => {
            ModalService.open('modalProductReserveCancel', {
                reservation: reservation,
                onConfirm: () => {
                    ProductReservationService.destroy(reservation.id).finally(() => {
                        $scope.onDelete({ reservation })
                        PushNotificationsService.success('Reservering geannuleerd.');
                    }, (res) => PushNotificationsService.danger('Error.', res.data.message));
                },
            });
        };
    };
};

module.exports = () => {
    return {
        scope: {
            reservation: '=',
            onDelete: '&',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'ModalService',
            'PushNotificationsService',
            'ProductReservationService',
            ReservationCardDirective,
        ],
        templateUrl: 'assets/tpl/directives/reservation-card.html'
    };
};