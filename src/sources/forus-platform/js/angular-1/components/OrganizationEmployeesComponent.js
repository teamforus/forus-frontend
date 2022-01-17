const OrganizationEmployeesComponent = function (
    $scope,
    $filter,
    ModalService,
    PushNotificationsService,
    OrganizationEmployeesService
) {
    const $ctrl = this;[];
    const str_limit = $filter('str_limit');

    $ctrl.filters = {};
    $ctrl.adminEmployees = [];

    $ctrl.transformEmployee = (employee) => {
        const rolesList = str_limit(employee.roles.map(role => role.name).sort((a, b) => {
            return a == b ? 0 : (a < b ? -1 : 1);
        }).join(', '), 64);

        return { ...employee, ...{ rolesList } };
    };

    $ctrl.transformEmployees = (data) => {
        return {
            meta: data.meta,
            data: data.data.map((employee) => $ctrl.transformEmployee(employee))
        };
    };

    $scope.onPageChange = (query) => {
        const filters = { ...$ctrl.filters, ...query };

        OrganizationEmployeesService.list($ctrl.organization.id, filters).then((res => {
            $ctrl.employees = $ctrl.transformEmployees(res.data);
            $ctrl.adminEmployees = $ctrl.filterAdminEmplyees($ctrl.employees.data);
        }));
    };

    $ctrl.createEmployee = () => {
        $ctrl.editEmployee(false);
    };

    $ctrl.editEmployee = (employee) => {
        const meta = $ctrl.employees.meta;
        const page = employee ? meta.current_page : meta.last_page;

        ModalService.open('employeeEdit', {
            organization: $ctrl.organization,
            roles: $ctrl.roles,
            employee: employee,
            submit: () => {
                $scope.onPageChange({ page });
                PushNotificationsService.success('Gelukt!', 'Nieuwe medewerker toegevoegd.');
            }
        });
    };

    $ctrl.deleteEmployee = function (employee) {
        OrganizationEmployeesService.destroy($ctrl.organization.id, employee.id).then(() => {
            $scope.onPageChange();
            PushNotificationsService.success('Removed', 'Employee removed!');
        }, (res) => PushNotificationsService.danger(res.data.message));
    }

    $ctrl.transferOwnership = function (employees) {
        ModalService.open('transferOrganizationOwnership', {
            organization: $ctrl.organization,
            employees: employees,
            submit: (employee) => {
                $ctrl.organization.identity_address = employee.identity_address;
                $scope.onPageChange();
            }
        });
    }

    $ctrl.filterAdminEmplyees = function (employees) {
        return employees.filter(employee => {
            return employee.roles.filter(role => role.key === 'admin').length > 0;
        }).filter(employee => {
            return employee.identity_address !== $ctrl.organization.identity_address;
        });
    };

    $ctrl.$onInit = function () {
        $ctrl.employees = $ctrl.transformEmployees($ctrl.employees);
        $ctrl.adminEmployees = $ctrl.filterAdminEmplyees($ctrl.employees.data);
    };
};

module.exports = {
    bindings: {
        organization: '<',
        employees: '<',
        roles: '<',
    },
    controller: [
        '$scope',
        '$filter',
        'ModalService',
        'PushNotificationsService',
        'OrganizationEmployeesService',
        OrganizationEmployeesComponent
    ],
    templateUrl: 'assets/tpl/pages/organization-employees.html'
};