let ModalFundAppendRequestRecordComponent = function(
    FormBuilderService,
    FundRequestValidatorService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.fundRequest = $ctrl.modal.scope.fundRequest;
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.onAppend = $ctrl.modal.scope.onAppend;

        $ctrl.form = FormBuilderService.build({
            record_type_key: 'partner_bsn',
            value: '',
        }, (form) => {
            if (!$ctrl.verificationRequested) {
                return $ctrl.verificationRequested = true;
            }

            FundRequestValidatorService.appendRecord(
                $ctrl.organization.id,
                $ctrl.fundRequest.id,
                form.values
            ).then((res) => {
                $ctrl.close();
                $ctrl.onAppend(res);
            }, res => {
                $ctrl.verificationRequested = false;
                form.errors = res.data.errors;
            });
        });
    };

    $ctrl.backToForm = () => {
        $ctrl.verificationRequested = false;
    };

    $ctrl.confirm = () => {
        $ctrl.close();
        $ctrl.onConfirm();
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
        ModalFundAppendRequestRecordComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-fund-append-request-record.html';
    }
};