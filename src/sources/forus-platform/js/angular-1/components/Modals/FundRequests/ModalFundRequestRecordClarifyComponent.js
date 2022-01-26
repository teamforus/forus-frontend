let ModalFundRequestRecordClarifyComponent = function(
    FormBuilderService,
    FundRequestValidatorService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        let submit = $ctrl.modal.scope.submit;
        let organization = $ctrl.modal.scope.organization;
        let requestRecord = $ctrl.modal.scope.requestRecord;

        $ctrl.form = FormBuilderService.build({
            question: ''
        }, (form) => {
            FundRequestValidatorService.requestRecordClarification(
                organization.id,
                requestRecord.fund_request_id,
                requestRecord.id,
                form.values.question
            ).then(() => {
                form.unlock();
                $ctrl.close();
                submit(null);
            }, (res) => {
                form.unlock();
                if (res.status === 422) {
                    return form.errors = res.data.errors;
                }

                $ctrl.close();
                submit(res);
            });
        }, true);
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
        ModalFundRequestRecordClarifyComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/fund-requests/modal-fund-request-clarify.html';
    }
};