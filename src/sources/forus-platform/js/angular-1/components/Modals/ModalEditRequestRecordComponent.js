const ModalEditRequestRecordComponent = function (
    FormBuilderService,
    FundRequestValidatorService,
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const { onEdit, fundRequest, organization, fundRequestRecord } = $ctrl.modal.scope;

        $ctrl.fundRequest = fundRequest;
        $ctrl.fundRequestRecord = fundRequestRecord;

        $ctrl.criterion = $ctrl.fundRequest?.fund?.criteria?.find((criterion) => {
            return criterion.id == $ctrl.fundRequestRecord.fund_criterion_id;
        });
        
        $ctrl.recordNumeric = fundRequestRecord.record_type.type == 'number';
        $ctrl.initialValue = $ctrl.recordNumeric ? parseFloat(fundRequestRecord.value) : fundRequestRecord.value;

        $ctrl.form = FormBuilderService.build({
            value: $ctrl.initialValue,
        }, (form) => {
            FundRequestValidatorService.updateRecord(
                organization.id,
                fundRequest.id,
                fundRequestRecord.id,
                form.values
            ).then(
                (res) => onEdit(res) & $ctrl.close(),
                (res) => form.errors = res.data.errors,
            );
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
        'FundRequestValidatorService',
        ModalEditRequestRecordComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-edit-request-record.html',
};