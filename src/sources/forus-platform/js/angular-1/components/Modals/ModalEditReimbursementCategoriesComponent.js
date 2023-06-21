const ModalEditReimbursementCategoriesComponent = function () {
    const $ctrl = this;

    $ctrl.register = ($dir) => {
        $ctrl.addCategory = () => $dir.editReimbursementCategory();
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