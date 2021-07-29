const ModalDangerZoneComponent = function($filter) {
    const $ctrl = this;
    const linesToArray = $filter('lines_to_array');

    $ctrl.$onInit = () => {
        $ctrl.header = $ctrl.modal.scope.header;
        $ctrl.title = $ctrl.modal.scope.title;

        $ctrl.cancelButton = $ctrl.modal.scope.cancelButton || 'Cancel';
        $ctrl.confirmButton = $ctrl.modal.scope.confirmButton || 'Confirm';

        $ctrl.description = $ctrl.modal.scope.description ? linesToArray($ctrl.modal.scope.description) : null;

        $ctrl.description_title = $ctrl.modal.scope.description_title;
        $ctrl.description_text = $ctrl.modal.scope.description_text ? linesToArray($ctrl.modal.scope.description_text) : null;

        $ctrl.confirmation = $ctrl.modal.scope.confirmation;
        $ctrl.confirmed = $ctrl.confirmation ? false : true;
        
        $ctrl.text_align = $ctrl.modal.scope.text_align || 'left';

        $ctrl.onConfirm = $ctrl.modal.scope.onConfirm;
        $ctrl.onCancel = $ctrl.modal.scope.onCancel;
    };

    $ctrl.confirm = () => {
        $ctrl.close();
        typeof $ctrl.onConfirm === 'function' && $ctrl.onConfirm();
    };

    $ctrl.cancel = () => {
        $ctrl.close();
        typeof $ctrl.onCancel === 'function' && $ctrl.onCancel();
    }
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$filter',
        ModalDangerZoneComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-danger-zone.html';
    }
};