const ModalTransferOrganizationOwnershipComponent = function(
    FormBuilderService,
    OrganizationService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.employees = $ctrl.modal.scope.employees;
        $ctrl.organization = $ctrl.modal.scope.organization;

        $ctrl.form = FormBuilderService.build({
            employee: $ctrl.modal.scope.employees[0]
        }, (form) => $ctrl.transferOrganizationOwnership(form.values.employee), true);
    };

    $ctrl.transferOrganizationOwnership = (employee) => {
        OrganizationService.transferOwnership($ctrl.organization.id, {
            employee_id: employee.id,
        }).then(() => {
            $ctrl.modal.scope.submit(employee);
            $ctrl.close();
        }, (res) => PushNotificationsService.danger(res.data.message));
    }
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