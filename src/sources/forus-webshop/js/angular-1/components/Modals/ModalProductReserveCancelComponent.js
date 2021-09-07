const ModalProductReserveCancelComponent = function(appConfigs) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.appConfigs = appConfigs;
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
        'appConfigs',
        ModalProductReserveCancelComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-product-reserve-cancel.html';
    }
};