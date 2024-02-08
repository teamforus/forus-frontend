const ReservationShowComponent = function (
    $q,
    $state,
    $timeout,
    ModalService,
    PageLoadingBarService,
    PushNotificationsService,
    ProductReservationService,
) {
    const $ctrl = this;

    $ctrl.showReservationExtraAmount = true;
    $ctrl.showReservationRefunds = true;

    const prepareStateAndProduct = () => {
        $ctrl.product = $ctrl.reservation.product;
        $ctrl.media = $ctrl.product.photo || $ctrl.product.logo || null;
        $ctrl.stateData = ProductReservationService.composeStateAndExpires($ctrl.reservation);
    }

    const fetchReservation = () => {
        return $q((resolve, reject) => {
            ProductReservationService.read($ctrl.reservation.id).then((res) => {
                $ctrl.reservation = res.data.data;
                $ctrl.showLoadingBtn = false;

                prepareStateAndProduct();
                resolve($ctrl.reservation);
            }, reject);
        })
    };

    $ctrl.payExtraReservation = () => {
        fetchReservation().then(() => {
            if (!$ctrl.reservation.extra_payment?.is_paid) {
                PageLoadingBarService.setProgress(0);

                ProductReservationService.checkoutExtra($ctrl.reservation.id).then(
                    (res) => document.location.href = res.data.url,
                    (res) => PushNotificationsService.danger('Error.', res.data.message),
                ).finally(() => PageLoadingBarService.setProgress(100));
            }
        });
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
                        prepareStateAndProduct();
                        PushNotificationsService.success('Reservering geannuleerd.');
                    },
                    (res) => PushNotificationsService.danger('Error.', res.data.message),
                ).finally(() => PageLoadingBarService.setProgress(100));
            },
        });
    };

    $ctrl.$onInit = function () {
        prepareStateAndProduct();

        if ($state.params.checkout && $ctrl.reservation.extra_payment?.is_pending) {
            $ctrl.showLoadingBtn = true;
            $timeout(fetchReservation, 5000);
        }
    };
};

module.exports = {
    bindings: {
        reservation: '<',
    },
    controller: [
        '$q',
        '$state',
        '$timeout',
        'ModalService',
        'PageLoadingBarService',
        'PushNotificationsService',
        'ProductReservationService',
        ReservationShowComponent,
    ],
    templateUrl: 'assets/tpl/pages/reservation-show.html',
};