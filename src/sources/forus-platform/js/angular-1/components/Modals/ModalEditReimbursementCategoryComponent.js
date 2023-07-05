const ModalEditReimbursementCategoryComponent = function (
    FormBuilderService,
    PushNotificationsService,
    ReimbursementCategoryService,
) {
    const $ctrl = this;

    $ctrl.buildForm = (onSubmit) => {
        const { name = '' } = ($ctrl.reimbursementCategory || {});

        return FormBuilderService.build({ name }, (form) => {
            const promise = $ctrl.reimbursementCategory ? ReimbursementCategoryService.update(
                $ctrl.organization.id,
                $ctrl.reimbursementCategory.id,
                form.values,
            ) : ReimbursementCategoryService.store(
                $ctrl.organization.id,
                form.values,
            );

            promise.then(() => {
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.close();
                onSubmit();
            }, (res) => {
                PushNotificationsService.danger('Error!', res?.data?.message);
                form.errors = res.data.errors;
            })
        });
    }

    $ctrl.$onInit = () => {
        const { organization, reimbursementCategory, onChange, onClose } = $ctrl.modal.scope;

        $ctrl.onClose = onClose;
        $ctrl.organization = organization;
        $ctrl.reimbursementCategory = reimbursementCategory;

        $ctrl.form = $ctrl.buildForm(onChange);
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'FormBuilderService',
        'PushNotificationsService',
        'ReimbursementCategoryService',
        ModalEditReimbursementCategoryComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-edit-reimbursement-category.html',
};