const ModalFundRequestRecordsDeclineComponent = function (
    FormBuilderService,
    FundRequestValidatorService,
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const { submit, organization, fundRequest } = $ctrl.modal.scope;
        $ctrl.fundRequest = fundRequest;

        $ctrl.form = FormBuilderService.build({ note: '' }, (form) => {
            FundRequestValidatorService.decline(
                organization.id,
                fundRequest.id,
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
        ModalFundRequestRecordsDeclineComponent
    ],
    templateUrl: 'assets/tpl/modals/fund-requests/modal-fund-request-records-decline.html',
};