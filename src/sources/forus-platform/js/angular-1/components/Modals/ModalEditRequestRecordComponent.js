let ModalEditRequestRecordComponent = function(
    FormBuilderService,
    FundRequestValidatorService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.fundRequest = $ctrl.modal.scope.fundRequest;
        $ctrl.fundRequestRecord = $ctrl.modal.scope.fundRequestRecord;
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.onEdit = $ctrl.modal.scope.onEdit;

        $ctrl.form = FormBuilderService.build({
            record_type_key: $ctrl.fundRequestRecord.record_type_key,
            value: $ctrl.fundRequestRecord.value,
        }, (form) => {
            FundRequestValidatorService.updateRecord(
                $ctrl.organization.id,
                $ctrl.fundRequest.id,
                $ctrl.fundRequestRecord.id,
                form.values
            ).then((res) => {
                $ctrl.closeModal();
                $ctrl.onEdit(res);
            }, res => {
                form.errors = res.data.errors;
            });
        });
    };

    $ctrl.closeModal = () => {
        $ctrl.close();
    };

    $ctrl.confirm = () => {
        $ctrl.close();
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'FormBuilderService',
        'FundRequestValidatorService',
        ModalEditRequestRecordComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-edit-request-record.html';
    }
};