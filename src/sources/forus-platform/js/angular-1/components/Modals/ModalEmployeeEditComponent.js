const ModalEmployeeEditComponent = function (
    FormBuilderService,
    OrganizationEmployeesService
) {
    const $ctrl = this;

    $ctrl.isChecked = (id) => $ctrl.form.values.roles.indexOf(id) != -1;
    $ctrl.toggleOption = (id) => {
        if ($ctrl.isChecked(id)) {
            $ctrl.form.values.roles = $ctrl.form.values.roles.filter(
                option => option != id
            );
        } else {
            $ctrl.form.values.roles.push(id);
        }
    };

    $ctrl.$onInit = () => {
        const { employee, organization } = $ctrl.modal.scope;
        const formValues = OrganizationEmployeesService.apiResourceToForm(employee);

        $ctrl.form = FormBuilderService.build(formValues, (form) => {
            let promise;
            const values = form.values;

            if (!employee) {
                promise = OrganizationEmployeesService.store(organization.id, values);
            } else {
                promise = OrganizationEmployeesService.update(organization.id, employee.id, values);
            }

            promise.then(() => {
                $ctrl.modal.scope.submit();
                $ctrl.close();
            }, (res) => {
                if (res.status == '429') {
                    form.errors = { email: [res.data.message] };
                } else {
                    form.errors = res.data.errors;
                }
            }).finally(() => form.unlock());
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
        'OrganizationEmployeesService',
        ModalEmployeeEditComponent
    ],
    templateUrl: 'assets/tpl/modals/modal-employee-edit.html',
};