const ModalFundRequestDisregardUndoComponent = function(
    FundRequestValidatorService,
    FormBuilderService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const { submit, organization, request } = $ctrl.modal.scope;

        $ctrl.form = FormBuilderService.build({}, (form) => {
            FundRequestValidatorService.disregardUndo(
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
        ModalFundRequestDisregardUndoComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/fund-requests/modal-fund-request-disregard-undo.html';
    }
};