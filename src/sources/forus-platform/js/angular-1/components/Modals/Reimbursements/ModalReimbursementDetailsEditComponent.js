const ModalReimbursementDetailsEditComponent = function (
    FormBuilderService,
    ReimbursementService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const { onSubmitted, reimbursement, organization, description } = $ctrl.modal.scope;

        $ctrl.reimbursement = reimbursement;
        $ctrl.onSubmitted = onSubmitted;
        $ctrl.description = description;

        $ctrl.form = FormBuilderService.build({
            provider_name: $ctrl.reimbursement.provider_name,
            category_name: $ctrl.reimbursement.category_name,
        }, (form) => {
            ReimbursementService.update(organization.id, $ctrl.reimbursement.id, {
                provider_name: form.values.provider_name,
                category_name: form.values.category_name,
            }).then((res) => {
                PushNotificationsService.success('Gelukt!', 'Declaration updated!');

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
        ModalReimbursementDetailsEditComponent,
    ],
    templateUrl: 'assets/tpl/modals/reimbursements/modal-reimbursement-details-edit.html',
};