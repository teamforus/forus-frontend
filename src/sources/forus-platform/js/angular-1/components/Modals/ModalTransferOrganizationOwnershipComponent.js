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
            employee_id: $ctrl.modal.scope.employees[0].id
        }, (form) => $ctrl.transferOrganizationOwnership(form.values.employee_id), true);
    };

    $ctrl.transferOrganizationOwnership = (employee_id) => {
        OrganizationService.transferOwnership($ctrl.organization.id, {
            employee_id: employee_id,
        }).then(() => {
            $ctrl.modal.scope.submit($ctrl.employees.find(employee => employee.id == employee_id));
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