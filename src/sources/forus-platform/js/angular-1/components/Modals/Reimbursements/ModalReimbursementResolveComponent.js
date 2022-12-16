const ModalReimbursementResolveComponent = function (
    FormBuilderService,
    ReimbursementService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const { state, onSubmitted, reimbursement, organization } = $ctrl.modal.scope;

        $ctrl.onSubmitted = onSubmitted;
        $ctrl.reimbursement = reimbursement;

        $ctrl.form = FormBuilderService.build({
            note: null,
            reason: null,
            state: state,
        }, (form) => {
            const { note, reason, state } = form.values;

            const values = {
                note: note ? note : null,
                state: state,
                reason: $ctrl.showReason && reason ? reason : null,
            };

            const promise = {
                declined: () => ReimbursementService.decline(organization.id, $ctrl.reimbursement.id, values),
                approved: () => ReimbursementService.approve(organization.id, $ctrl.reimbursement.id, values),
            }[state] || null;

            if (!promise) {
                return;
            }

            PageLoadingBarService.setProgress(0);

            promise().then((res) => {
                PushNotificationsService.success('Gelukt!', {
                    declined: 'Declaratie afgewezen!',
                    approved: 'Declaratie goedgekeurd!',
                }[state] || null);

                $ctrl.onSubmitted(res);
                $ctrl.close();
            }, (res) => {
                PushNotificationsService.danger('Mislukt!', res.data.message);
                $ctrl.form.errors = res.data.errors;
                form.unlock();
            }).finally(() => PageLoadingBarService.setProgress(100));
        }, true)
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'FormBuilderService',
        'ReimbursementService',
        'PageLoadingBarService',
        'PushNotificationsService',
        ModalReimbursementResolveComponent,
    ],
    templateUrl: 'assets/tpl/modals/reimbursements/modal-reimbursement-resolve.html',
};