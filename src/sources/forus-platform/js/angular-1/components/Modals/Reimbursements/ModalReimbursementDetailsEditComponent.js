const ModalReimbursementDetailsEditComponent = function (
    ModalService,
    FormBuilderService,
    ReimbursementService,
    PageLoadingBarService,
    PushNotificationsService,
    ReimbursementCategoryService,
) {
    const $ctrl = this;

    $ctrl.buildForm = () => {
        $ctrl.form = FormBuilderService.build({
            provider_name: $ctrl.reimbursement.provider_name,
            reimbursement_category_id: $ctrl.reimbursement.reimbursement_category?.id || null,
        }, (form) => {
            ReimbursementService.update($ctrl.organization.id, $ctrl.reimbursement.id, {
                provider_name: form.values.provider_name,
                reimbursement_category_id: form.values.reimbursement_category_id,
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
    }

    $ctrl.fetchCategories = () => {
        return ReimbursementCategoryService.index($ctrl.organization.id, {
            per_page: 100,
        }).then((res) => {
            $ctrl.reimbursement_categories = res.data.data;

            $ctrl.reimbursement_categories.unshift({
                id: null,
                name: 'Alle categorieën',
            });
        });
    };

    $ctrl.manageCategories = () => {
        ModalService.open('editReimbursementCategories', {
            organization: $ctrl.organization,
            onClose: () => $ctrl.fetchCategories(),
        });
    };

    $ctrl.$onInit = () => {
        const { onSubmitted, reimbursement, organization, description } = $ctrl.modal.scope;

        $ctrl.reimbursement = reimbursement;
        $ctrl.organization = organization;
        $ctrl.onSubmitted = onSubmitted;
        $ctrl.description = description;

        $ctrl.fetchCategories().then(() => $ctrl.buildForm());
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'ModalService',
        'FormBuilderService',
        'ReimbursementService',
        'PageLoadingBarService',
        'PushNotificationsService',
        'ReimbursementCategoryService',
        ModalReimbursementDetailsEditComponent,
    ],
    templateUrl: 'assets/tpl/modals/reimbursements/modal-reimbursement-details-edit.html',
};