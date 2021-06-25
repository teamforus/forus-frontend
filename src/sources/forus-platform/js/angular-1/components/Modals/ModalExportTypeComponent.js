const ModalExportTypeComponent = function(FormBuilderService) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.form = FormBuilderService.build({
            exportType: 'xls'
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
        ModalExportTypeComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-export-type-select.html';
    }
};