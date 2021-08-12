const ModalVoucherActivationComponent = function(FormBuilderService) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const { onSubmit, voucher } = $ctrl.modal.scope;

        $ctrl.voucher = voucher;

        $ctrl.form = FormBuilderService.build({ note: '' }, (form) => {
            $ctrl.close();
            onSubmit(form.values);
        }, false);
    };
    $ctrl.$onDestroy = function() { };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'FormBuilderService',
        ModalVoucherActivationComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-voucher-activation.html';
    }
};