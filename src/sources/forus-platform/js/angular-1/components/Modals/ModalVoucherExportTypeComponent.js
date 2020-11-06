let ModalVoucherExportTypeComponent = function(FormBuilderService) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.form = FormBuilderService.build({
            exportType: 'png'
        }, (form) => {
            $ctrl.modal.scope.success(form.values);

            $ctrl.close();
        });
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'FormBuilderService',
        ModalVoucherExportTypeComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-voucher-export-type-select.html';
    }
};