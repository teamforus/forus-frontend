const ModalReimbursementConfirmComponent = function () {
    const $ctrl = this;

    $ctrl.confirm = () => {
        $ctrl.close();
        $ctrl.onConfirm();
    }

    $ctrl.$onInit = () => {
        const { reimbursement, onConfirm } = $ctrl.modal.scope;

        $ctrl.onConfirm = onConfirm;
        $ctrl.reimbursement = reimbursement;
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        ModalReimbursementConfirmComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-reimbursement-confirm.html',
};