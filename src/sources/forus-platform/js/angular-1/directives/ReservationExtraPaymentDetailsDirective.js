const ReservationExtraPaymentDetailsDirective = function (
    $scope,
    appConfigs,
    PushNotificationsService,
    ProductReservationService
) {
    const $dir = $scope.$dir;

    $dir.fetchReservationExtraPayment = () => {
        ProductReservationService.fetchReservationExtraPayment($dir.organization.id, $dir.reservation.id).then((res) => {
            $dir.reservation = res.data.data;
            $dir.payment = $dir.reservation.extra_payment;
            PushNotificationsService.success('Opgeslagen!');
        }, (res) => PushNotificationsService.danger(res.data.message));
    };

    $dir.refundReservationExtraPayment = () => {
        ProductReservationService.refundReservationExtraPayment($dir.organization.id, $dir.reservation.id).then((res) => {
                $dir.reservation = res.data.data;
                $dir.payment = $dir.reservation.extra_payment;
                PushNotificationsService.success('Refund created!');
            }, (res) => PushNotificationsService.danger(res.data?.message || 'Onbekende foutmelding!')
        );
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
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'appConfigs',
            'PushNotificationsService',
            'ProductReservationService',
            ReservationExtraPaymentDetailsDirective
        ],
        templateUrl: 'assets/tpl/directives/reservation-extra-payment.html'
    };
};