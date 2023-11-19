const ReservationCardDirective = function (
    $scope,
    $state,
    ModalService,
    PushNotificationsService,
    ProductReservationService,
) {
    const { $dir } = $scope;
    $dir.showExtraDetails = false;

    $dir.goToProvider = ($event) => {
        $event.stopPropagation();
        $event.preventDefault();

        $state.go('provider', {
            id: $dir.product.organization.id
        });
    };

    $dir.goToProduct = ($event) => {
        $event.stopPropagation();
        $event.preventDefault();

        $state.go('product', {
            id: $dir.product.id
        });
    };

    $dir.showExtraPaymentDetails = ($event) => {
        $event.stopPropagation();
        $event.preventDefault();

        $dir.showExtraDetails = !$dir.showExtraDetails;
    }

    $dir.cancelReservation = ($event, reservation) => {
        $event.stopPropagation();
        $event.preventDefault();

        ModalService.open('modalProductReserveCancel', {
            reservation: reservation,
            onConfirm: () => {
                ProductReservationService.update(reservation.id, {
                    state: 'canceled_by_client',
                }).finally(() => {
                    $dir.onDelete({ reservation })
                    PushNotificationsService.success('Reservering geannuleerd.');
                }, (res) => PushNotificationsService.danger('Error.', res.data.message));
            },
        });
    };

    $dir.payExtraReservation = ($event) => {
        $event.stopPropagation();
        $event.preventDefault();

        ProductReservationService.payExtra($dir.reservation.id).then((res) => {
            document.location.href = res.data.url
        }, (res) => PushNotificationsService.danger('Error.', res.data.message));
    };

    $dir.$onInit = () => {
        $dir.product = $dir.reservation.product;
        $dir.media =  $dir.product.photo ||  $dir.product.logo || null;

        $dir.stateData = ProductReservationService.composeStateAndExpires($dir.reservation);
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
            '$state',
            'ModalService',
            'PushNotificationsService',
            'ProductReservationService',
            ReservationCardDirective,
        ],
        templateUrl: 'assets/tpl/directives/reservation-card.html',
    };
};