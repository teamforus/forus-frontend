const ReservationExtraPaymentDetailsDirective = function (
    $scope,
    appConfigs,
    PageLoadingBarService,
    PushNotificationsService,
    ProductReservationService,
) {
    const $dir = $scope.$dir;

    $dir.fetchReservationExtraPayment = () => {
        PageLoadingBarService.setProgress(0);

        ProductReservationService.fetchReservationExtraPayment($dir.organization.id, $dir.reservation.id).then(
            (res) => {
                $dir.reservation = res.data.data;
                $dir.payment = $dir.reservation.extra_payment;
                PushNotificationsService.success('Opgeslagen!');
            },
            (res) => PushNotificationsService.danger(res.data.message),
        ).finally(() => PageLoadingBarService.setProgress(100));
    };

    $dir.refundReservationExtraPayment = () => {
        ProductReservationService.confirmRefund(() => {
            PageLoadingBarService.setProgress(0);

            ProductReservationService.refundReservationExtraPayment($dir.organization.id, $dir.reservation.id).then(
                (res) => {
                    $dir.reservation = res.data.data;
                    $dir.payment = $dir.reservation.extra_payment;
                    PushNotificationsService.success('Refund created!');
                    if (typeof $dir.onUpdate == 'function') {
                        $dir.onUpdate();
                    }
                },
                (res) => PushNotificationsService.danger(res.data?.message || 'Onbekende foutmelding!')
            ).finally(() => PageLoadingBarService.setProgress(100));
        });
    };

    $dir.$onInit = () => {
        $dir.isProvider = appConfigs.panel_type == 'provider';
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            payment: '=',
            reservation: '=',
            organization: '=',
            onUpdate: '&',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'appConfigs',
            'PageLoadingBarService',
            'PushNotificationsService',
            'ProductReservationService',
            ReservationExtraPaymentDetailsDirective,
        ],
        templateUrl: 'assets/tpl/directives/reservation-extra-payment-details.html',
    };
};