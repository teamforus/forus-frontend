const ModalEditReimbursementCategoriesComponent = function () {
    const $ctrl = this;

    $ctrl.closeModal = () => {
        $ctrl.close();
        $ctrl.modal.scope.onClose();
    };

    $ctrl.$onInit = () => {
        $ctrl.organization = $ctrl.modal.scope.organization;
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        ModalEditReimbursementCategoriesComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-edit-reimbursement-categories.html',
};