const ModalTransferOrganizationOwnershipComponent = function (
    FormBuilderService,
    OrganizationService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.buildForm = (organization, adminEmployees) => {
        return FormBuilderService.build({
            employee_id: adminEmployees[0]?.id,
        }, (form) => {
            const { employee_id } = form.values;

            OrganizationService.transferOwnership(organization.id, { employee_id }).then(() => {
                $ctrl.modal.scope.submit(adminEmployees.find((employee) => employee.id == employee_id));
                $ctrl.close();
            }, (res) => {
                form.errors = res.data?.errors;
                PushNotificationsService.danger('Error!', res.data.message);
            });
        }, true);
    }

    $ctrl.$onInit = () => {
        const { organization, adminEmployees } = $ctrl.modal.scope;

        $ctrl.adminEmployees = adminEmployees;
        $ctrl.form = $ctrl.buildForm(organization, adminEmployees);
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'FormBuilderService',
        'OrganizationService',
        'PushNotificationsService',
        ModalTransferOrganizationOwnershipComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-transfer-organization-ownership.html';
    }
};