const ModalReservationNotesComponent = function() {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.reservation = $ctrl.modal.scope.reservation;
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
        reservation: '<',
    },
    controller: ModalReservationNotesComponent,
    templateUrl: 'assets/tpl/modals/modal-reservation-notes.html',
};