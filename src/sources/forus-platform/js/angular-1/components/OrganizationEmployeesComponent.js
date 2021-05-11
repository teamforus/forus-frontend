let OrganizationEmployeesComponent = function(
    $q,
    $scope,
    $timeout,
    ModalService,
    PushNotificationsService,
    OrganizationEmployeesService
) {
    let $ctrl = this;

    $ctrl.loaded = false;
    $ctrl.filters = {
        values: {},
    };

    $ctrl.transformEmployee = (employee) => {
        employee.rolesList = employee.roles.map(role => role.name).sort(
            (a, b) => a == b ? 0 : (a < b ? -1 : 1)
        ).join(', ');

        return employee;
    };

    $ctrl.transformEmployeesList = (employees) => {
        return employees.map(employee => $ctrl.transformEmployee(employee));
    };

    $scope.onPageChange = async (query) => {
        return $q((resolve, reject) => {
            OrganizationEmployeesService.list(
                $ctrl.organization.id, 
                Object.assign({}, query, $ctrl.filters.values)
            ).then((res => {
                $ctrl.employees = {
                    meta: res.data.meta,
                    data: $ctrl.transformEmployeesList(res.data.data),
                };

                resolve($ctrl.employees);
            }), reject);
        });
    };

    $ctrl.$onInit = function() {
        $scope.onPageChange().then(() => {
            $timeout(() => {
                $ctrl.loaded = true;
            }, 0);
        });
    };

    $ctrl.createEmployee = () => {
        $ctrl.editEmployee(false);
    };

    $ctrl.editEmployee = (employee) => {
        ModalService.open('employeeEdit', {
            organization: $ctrl.organization,
            roles: $ctrl.roles,
            employee: employee,
            submit: () => {
                $scope.onPageChange({
                    page: employee ? 
                        $ctrl.employees.meta.current_page : 
                        $ctrl.employees.meta.last_page
                });
            }
        });
    };

    $ctrl.deleteEmployee = function(employee) {
        OrganizationEmployeesService.destroy(
            employee.organization_id,
            employee.id
        ).then((res) => {
            $scope.onPageChange({
                page: $ctrl.employees.meta.current_page
            });
        }, (res) => {
            console.error(res);
            PushNotificationsService.danger(res.data.message);
        });
    }

    $ctrl.transferOwnership = function(employee) {
        ModalService.open('transferOrganizationOwnership', {
            organization: $ctrl.organization,
            employee: employee,
            employees: $ctrl.employees.data,
            submit: () => {
                $ctrl.organization.identity_address = employee.identity_address;
                
                $scope.onPageChange({
                    page: $ctrl.employees.meta.current_page
                });
            }
        });
    }
};

module.exports = {
    bindings: {
        organization: '<',
        roles: '<',
        employees: '<'
    },
    controller: [
        '$q',
        '$scope',
        '$timeout',
        'ModalService',
        'PushNotificationsService',
        'OrganizationEmployeesService',
        OrganizationEmployeesComponent
    ],
    templateUrl: 'assets/tpl/pages/organization-employees.html'
};