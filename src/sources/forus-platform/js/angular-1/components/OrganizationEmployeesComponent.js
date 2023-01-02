const OrganizationEmployeesComponent = function (
    $scope,
    $filter,
    FileService,
    ModalService,
    PushNotificationsService,
    OrganizationEmployeesService,
    appConfigs,
) {
    const $ctrl = this;
    const str_limit = $filter('str_limit');
    const $translate = $filter('translate');

    const $translateDangerZone = (key) => {
        return $translate(`modals.danger_zone.remove_organization_employees.${key}`);
    };

    $ctrl.filters = {
        values: {
            q: "",
            per_page: 15,
        }
    };

    $ctrl.transformEmployee = (employee) => {
        const rolesList = employee.roles
            .map(role => role.name)
            .sort((a, b) => a == b ? 0 : (a < b ? -1 : 1))
            .join(', ');

        return { ...employee, rolesList: str_limit(rolesList, 64) };
    };

    $ctrl.transformEmployees = (data) => {
        return {
            meta: data.meta,
            data: data.data.map((employee) => $ctrl.transformEmployee(employee))
        };
    };

    $scope.onPageChange = (query) => {
        const filters = { ...$ctrl.filters.values, ...query };

        OrganizationEmployeesService.list($ctrl.organization.id, filters).then((res => {
            $ctrl.employees = $ctrl.transformEmployees(res.data);
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
        ModalService.open("dangerZone", {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            onConfirm: () => {
                OrganizationEmployeesService.destroy($ctrl.organization.id, employee.id).then(() => {
                    $scope.onPageChange();
                    PushNotificationsService.success('Gelukt!', 'Medewerker verwijderd.');
                }, (res) => PushNotificationsService.danger(res.data.message));
            }
        });
    }

    $ctrl.transferOwnership = function (adminEmployees) {
        ModalService.open('transferOrganizationOwnership', {
            adminEmployees,
            organization: $ctrl.organization,
            submit: (employee) => {
                $ctrl.organization.identity_address = employee.identity_address;
                $scope.onPageChange();
            }
        });
    }

    $ctrl.fetchAdminEmployees = () => {
        return OrganizationEmployeesService.list($ctrl.organization.id, {
            role: 'admin',
            per_page: 1000,
        }).then((res) => res.data.data.filter((employee) => {
            return employee.identity_address !== $ctrl.organization.identity_address;
        }));
    };

    $ctrl.export = () => {
        ModalService.open('exportType', {
            success: (data) => {
                OrganizationEmployeesService.export($ctrl.organization.id, {
                    ...$ctrl.filters.values,
                    export_type: data.exportType,
                }).then((res => {
                    const dateTime = moment().format('YYYY-MM-DD HH:mm:ss');
                    const fileData = res.data;
                    const fileType = res.headers('Content-Type') + ';charset=utf-8;';
                    const fileName = `${appConfigs.panel_type}_${$ctrl.organization.name}_employees_${dateTime}.${data.exportType}`;

                    FileService.downloadFile(fileName, fileData, fileType);
                }), console.error);
            }
        });
    };

    $ctrl.$onInit = function () {
        $ctrl.employees = $ctrl.transformEmployees($ctrl.employees);
        $ctrl.fetchAdminEmployees().then((adminEmployees) => $ctrl.adminEmployees = adminEmployees)
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
        'FileService',
        'ModalService',
        'PushNotificationsService',
        'OrganizationEmployeesService',
        'appConfigs',
        OrganizationEmployeesComponent,
    ],
    templateUrl: 'assets/tpl/pages/organization-employees.html',
};