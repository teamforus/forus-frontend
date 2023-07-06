const ModalFundRequestRecordClarifyComponent = function (
    FormBuilderService,
    FundRequestValidatorService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const { submit, organization, requestRecord, fundRequest } = $ctrl.modal.scope;
        $ctrl.fundRequest = fundRequest;

        $ctrl.form = FormBuilderService.build({ question: '' }, (form) => {
            FundRequestValidatorService.requestRecordClarification(
                organization.id,
                requestRecord.fund_request_id,
                requestRecord.id,
                form.values.question
            ).then(() => {
                form.unlock();
                $ctrl.close();
                submit();
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
    templateUrl: 'assets/tpl/modals/fund-requests/modal-fund-request-clarify.html',
};