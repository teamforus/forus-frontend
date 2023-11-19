const ReservationExtraPaymentRefundsDirective = function ($scope) {
    const $dir = $scope.$dir;

    $dir.$onInit = () => {};
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            refunds: '=',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            ReservationExtraPaymentRefundsDirective
        ],
        templateUrl: 'assets/tpl/directives/reservation-extra-payment-refunds.html'
    };
};