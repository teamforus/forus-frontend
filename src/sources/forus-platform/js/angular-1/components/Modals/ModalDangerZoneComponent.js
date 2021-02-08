let ModalDangerZoneComponent = function() {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.header = $ctrl.modal.scope.header;
        $ctrl.title = $ctrl.modal.scope.title;
        $ctrl.description = $ctrl.modal.scope.description;
        $ctrl.cancelButton = $ctrl.modal.scope.cancelButton || 'Cancel';
        $ctrl.confirmButton = $ctrl.modal.scope.confirmButton || 'Confirm';

        $ctrl.onConfirm = $ctrl.modal.scope.onConfirm;
    };

    $ctrl.confirm = () => {
        $ctrl.close();
        $ctrl.onConfirm();
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        ModalDangerZoneComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-danger-zone.html';
    }
};