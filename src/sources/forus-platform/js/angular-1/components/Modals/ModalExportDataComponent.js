const ModalExportDataComponent = function(FormBuilderService, PushNotificationsService) {
    const $ctrl = this;
    
    $ctrl.fileType = 'csv';
    $ctrl.qrCodesExportType = 'none';
    $ctrl.enableAllFields   = false;
    $ctrl.exportFields      = [];
    
    let exportFieldsPerRowShown = 3;

    $ctrl.changeFileType = (type) => {
        $ctrl.form.values.fileType = type;
    };

    $ctrl.changeQrCodesExportType = (type) => {
        $ctrl.form.values.qrCodesExportType = type;
    };

    $ctrl.checkAllFields = () => {
        $ctrl.enableAllFields = !$ctrl.enableAllFields;

        $ctrl.form.values.exportFields.forEach((rowFields, index) => {
            $ctrl.form.values.exportFields[index] = rowFields.map(
                field => ({...field, enabled: $ctrl.enableAllFields})
            );
        });
    };

    $ctrl.$onInit = () => {
        let tableRowsCount = Math.floor(($ctrl.modal.scope.fields.length - 1) / exportFieldsPerRowShown) + 1;
        for (let i = 0; i < tableRowsCount; ++i) {
            $ctrl.exportFields[i] = [];
        }

        $ctrl.modal.scope.fields.forEach((field, index) => {
            let tableRowNr = Math.floor(index / exportFieldsPerRowShown);
            $ctrl.exportFields[tableRowNr].push({...field, enabled: false});
        });

        $ctrl.form = FormBuilderService.build({
            exportFieldsRawList: [],
            qrCodesExportType: $ctrl.qrCodesExportType,
            exportFields: $ctrl.exportFields,
            fileType: $ctrl.fileType,
        }, (form) => {
            form.values.exportFields.forEach((rowFields, index) => {
                let enabledFields = rowFields.filter(field => field.enabled);

                form.values.exportFieldsRawList = [
                    ...form.values.exportFieldsRawList, ...enabledFields.map(field => field.key)
                ];
            });

            if (form.values.exportFieldsRawList.length == 0) {
                PushNotificationsService.danger('You should select at least one field!');
                return;
            }

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
        'PushNotificationsService',
        ModalExportDataComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-export-data-select.html';
    }
};