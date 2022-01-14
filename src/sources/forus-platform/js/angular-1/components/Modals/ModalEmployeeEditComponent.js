let ModalEmployeeEditComponent = function(
    FormBuilderService,
    OrganizationEmployeesService
) {
    let $ctrl = this;

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
        let values = OrganizationEmployeesService.apiResourceToForm(
            $ctrl.modal.scope.employee
        );

        $ctrl.form = FormBuilderService.build(values, (form) => {
            form.lock();

            let promise;

            if (!$ctrl.modal.scope.employee) {
                promise = OrganizationEmployeesService.store(
                    $ctrl.modal.scope.organization.id,
                    form.values
                );
            } else {
                promise = OrganizationEmployeesService.update(
                    $ctrl.modal.scope.organization.id,
                    $ctrl.modal.scope.employee.id,
                    form.values
                );
            }

            promise.then(() => {
                $ctrl.modal.scope.submit();
                $ctrl.close();
            }, (res) => {
                if (res.status == '429') {
                    form.errors = {
                        email: new Array(res.data.message)
                    };
                } else {
                    form.errors = res.data.errors;
                }

                form.unlock();
            })
        })
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
    templateUrl: () => {
        return 'assets/tpl/modals/modal-employee-edit.html';
    }
};