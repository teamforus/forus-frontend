let ModalFundRequestRecordsDeclineComponent = function(
    FundRequestValidatorService,
    FormBuilderService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        let submit = $ctrl.modal.scope.submit;
        let organization = $ctrl.modal.scope.organization;
        let request = $ctrl.modal.scope.request;

        $ctrl.form = FormBuilderService.build({
            note: ''
        }, (form) => {
            FundRequestValidatorService.decline(
                organization.id,
                request.id,
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
        'FundRequestValidatorService',
        'FormBuilderService',
        ModalFundRequestRecordsDeclineComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/fund-requests/modal-fund-request-records-decline.html';
    }
};