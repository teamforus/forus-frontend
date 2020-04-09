let ModalVoucherExportTypeComponent = function(
    FormBuilderService,
    VoucherService
) {
    let $ctrl = this;
    
    $ctrl.$onInit = () => {
        $ctrl.form = FormBuilderService.build({
            exportType: 'png'
        }, (form) => {
            $ctrl.modal.scope.success(form.values);

            $ctrl.close();
        });
    };

    $ctrl.$onDestroy = function() {};
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'FormBuilderService',
        'VoucherService',
        ModalVoucherExportTypeComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-voucher-export-type-select.html';
    }
};