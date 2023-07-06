const ModalFundRequestRecordDeclineComponent = function (
    FormBuilderService,
    FundRequestValidatorService,
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const { submit, organization, fundRequest, requestRecord } = $ctrl.modal.scope;
        $ctrl.fundRequest = fundRequest;

        $ctrl.form = FormBuilderService.build({ note: '' }, (form) => {
            FundRequestValidatorService.declineRecord(
                organization.id,
                fundRequest.id,
                requestRecord.id,
                form.values.note
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
        ModalFundRequestRecordDeclineComponent
    ],
    templateUrl: 'assets/tpl/modals/fund-requests/modal-fund-request-record-decline.html',
};