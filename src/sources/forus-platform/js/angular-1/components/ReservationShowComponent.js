const ReservationShowComponent = function () {
    const $ctrl = this;

    $ctrl.$onInit = function () {}
};

module.exports = {
    bindings: {
        organization: '<',
        reservation: '<',
    },
    controller: [
        ReservationShowComponent,
    ],
    templateUrl: 'assets/tpl/pages/reservation-show.html',
};