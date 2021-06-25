const ModalProductReserveCancelComponent = function() {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.reservation = $ctrl.modal.scope.reservation;

        $ctrl.onConfirm = () => {
            $ctrl.close();
            $ctrl.modal.scope.onConfirm();
        };
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        ModalProductReserveCancelComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-product-reserve-cancel.html';
    }
};