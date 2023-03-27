const FundRequestsComponent = function (
    $state,
    $timeout,
    FileService,
    ModalService,
    FundRequestValidatorService,
    appConfigs
) {
    const $ctrl = this;

    $ctrl.funds = [];
    $ctrl.validatorRequests = null;

    $ctrl.states = [{
        key: null,
        name: 'Alle'
    }, {
        key: 'approved',
        name: 'Geaccepteerd'
    }, {
        key: 'disregarded',
        name: 'Niet beoordeeld'
    }, {
        key: 'declined',
        name: 'Geweigerd'
    }, {
        key: 'pending',
        name: 'Wachtend'
    }];

    $ctrl.stateLabels = {
        pending: 'label-primary-variant',
        declined: 'label-danger',
        approved: 'label-success',
        approved_partly: 'label-success',
        disregarded: 'label-default'
    };

    $ctrl.stateLabelIcons = {
        pending: 'circle-outline',
        declined: 'circle-off-outline',
        approved: 'circle-slice-8',
        approved_partly: 'circle-slice-4',
        disregarded: 'circle-outline'
    };

    $ctrl.filters = {
        show: false,
        values: {},
        defaultValues: {
            page: 1,
            per_page: 10,
            q: '',
            state: $ctrl.states[0].key,
            employee_id: null,
            from: '',
            to: null,
            order_by: 'state',
            order_dir: 'asc'
        },
        reset: function () {
            this.values = { ...this.values, ...this.defaultValues };
        }
    };

    $ctrl.fetchRequests = (query) => {
        FundRequestValidatorService.indexAll($ctrl.organization.id, query).then(function (res) {
            const data = res.data.data.map((request) => {
                const ui_sref = { id: request.id, organization_id: $ctrl.organization.id };
                const assigned_employees = request.records
                    .filter((record) => record.employee?.organization_id == $ctrl.organization.id)
                    .map((record) => record.employee?.email)
                    .reduce((list, email) => list.includes(email) ? list : [...list, email], []);

                return {
                    ...request,
                    ui_sref: ui_sref,
                    assigned_employees: assigned_employees,
                }
            });

            $ctrl.validatorRequests = { ...res.data, data };
        }, console.error);
    };

    $ctrl.hideFilters = () => {
        $timeout(() => $ctrl.filters.show = false);
    };

    $ctrl.exportRequests = () => {
        ModalService.open('exportType', {
            success: (data) => {
                FundRequestValidatorService.exportAll($ctrl.organization.id, {
                    ...$ctrl.filters.values,
                    ...{ export_format: data.exportType },
                }).then((res => {
                    const fileName = [
                        appConfigs.panel_type,
                        $ctrl.organization.id,
                        moment().format('YYYY-MM-DD HH:mm:ss') + '.' + data.exportType,
                    ].join('_');

                    FileService.downloadFile(fileName, res.data, res.headers('Content-Type'));
                }), console.error);
            }
        });
    };

    $ctrl.onPageChange = (query) => {
        $ctrl.fetchRequests(query);
    };

    $ctrl.$onInit = function () {
        if (!appConfigs.features.organizations.funds.fund_requests) {
            return $state.go('csv-validation');
        }

        $ctrl.employees.data.unshift({
            id: null,
            email: "Alle medewerker"
        });

        $ctrl.employees.data.unshift({
            id: 'null',
            email: "Niet toegewezen"
        });

        $ctrl.filters.reset();
        $ctrl.fetchRequests($ctrl.filters.values);
    };
};

module.exports = {
    bindings: {
        funds: '<',
        appConfigs: '<',
        authUser: '<',
        employees: '<',
        organization: '<',
    },
    controller: [
        '$state',
        '$timeout',
        'FileService',
        'ModalService',
        'FundRequestValidatorService',
        'appConfigs',
        FundRequestsComponent,
    ],
    templateUrl: 'assets/tpl/pages/fund-requests.html',
};
