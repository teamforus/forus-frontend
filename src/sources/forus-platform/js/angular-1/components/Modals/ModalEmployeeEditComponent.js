const ModalEmployeeEditComponent = function (
    FormBuilderService,
    OrganizationEmployeesService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const { employee, organization } = $ctrl.modal.scope;
        const formValues = OrganizationEmployeesService.apiResourceToForm(employee);

        $ctrl.roles = formValues.roles.reduce((roles, role) => ({ ...roles, [role]: true }), {});

        $ctrl.form = FormBuilderService.build(formValues, (form) => {
            const roles = Object.keys($ctrl.roles).filter((key) => $ctrl.roles[key]);
            const values = { ...form.values, roles: roles };

            const promise = employee ?
                OrganizationEmployeesService.update(organization.id, employee.id, values) :
                OrganizationEmployeesService.store(organization.id, values);

            promise.then(() => {
                $ctrl.modal.scope.submit();
                $ctrl.close();
            }, (res) => {
                form.errors = res.status == '429' ? { email: [res.data.message] } : res.data.errors;
            }).finally(() => form.unlock());
        }, true)
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'FormBuilderService',
        'OrganizationEmployeesService',
        ModalEmployeeEditComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-employee-edit.html',
};