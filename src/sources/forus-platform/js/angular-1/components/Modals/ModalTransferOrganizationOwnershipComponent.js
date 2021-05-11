let ModalTransferOrganizationOwnershipComponent = function (
    FormBuilderService,
    OrganizationEmployeesService,
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.employee  = $ctrl.modal.scope.employee;
        $ctrl.employees = $ctrl.modal.scope.employees;
        $ctrl.organization = $ctrl.modal.scope.organization;

        $ctrl.form = FormBuilderService.build({
            employee: $ctrl.employee
        }, (form) => {
            $ctrl.transferOrganizationOwnership(form.values.employee);
        }, true);
    };

    $ctrl.transferOrganizationOwnership = (employee) => {
        OrganizationEmployeesService.transferOwnership(
            employee.organization_id, {
                to_employee: employee.id
            }
        ).then((res) => {
            $ctrl.modal.scope.submit();
            $ctrl.close();
        }, (res) => {
            console.error(res);
            PushNotificationsService.danger(res.data.message);
        });
    }
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'FormBuilderService',
        'OrganizationEmployeesService',
        'PushNotificationsService',
        ModalTransferOrganizationOwnershipComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-transfer-organization-ownership.html';
    }
};