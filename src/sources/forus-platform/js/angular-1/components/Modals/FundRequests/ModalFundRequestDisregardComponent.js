const ModalFundRequestDisregardComponent = function(
    FundRequestValidatorService,
    FormBuilderService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const { submit, organization, request } = $ctrl.modal.scope;

        $ctrl.form = FormBuilderService.build({
            note: '',
            notify: true,
        }, (form) => {
            FundRequestValidatorService.disregard(
                organization.id,
                request.id,
                form.values
            ).then(() => {
                submit(null);
                $ctrl.close();
            }, (res) => {
                if (res.status === 422) {
                    return form.errors = res.data.errors;
                }

                submit(res);
                $ctrl.close();
            }).finally(() => form.unlock());
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
        ModalFundRequestDisregardComponent
    ],
    templateUrl: 'assets/tpl/modals/fund-requests/modal-fund-request-disregard.html',
};