const FundRequestsComponent = function(
    $state,
    $timeout,
    FileService,
    ModalService,
    DateService,
    FundRequestValidatorService,
    appConfigs
) {
    const $ctrl = this;

    const reloadRequests = (query) => {
        FundRequestValidatorService.indexAll($ctrl.organization.id, {
            ...query,
            ...{
                from: query.from ? DateService._frontToBack(query.from) : null,
                to: query.to ? DateService._frontToBack(query.to) : null,
            }
        }).then(function(res) {
            const data = res.data.data.map((validatorRequest) => {
                const ui_sref = ({
                    id: validatorRequest.id,
                    organization_id: $ctrl.organization.id,
                });

                return { ...validatorRequest, ui_sref };
            });

            $ctrl.validatorRequests = { ...res.data, data };

        }, console.error);
    };

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

    $ctrl.stateClasses = {
        pending: 'label-primary-light',
        declined: 'label-danger',
        approved: 'label-success',
        approved_partly: 'label-success',
        disregarded: 'label-default'
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
            sort_by: 'state',
            sort_order: 'asc'
        },
        reset: function() {
            this.values = { ...this.values, ...this.defaultValues };
        }
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
        reloadRequests(query);
    };

    $ctrl.$onInit = function() {
        if (!appConfigs.features.organizations.funds.fund_requests) {
            return $state.go('csv-validation');
        }

        $ctrl.employees.data.unshift({
            id: null,
            email: "Selecteer medewerker"
        });

        $ctrl.filters.reset();

        reloadRequests($ctrl.filters.values);
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
        'DateService',
        'FundRequestValidatorService',
        'appConfigs',
        FundRequestsComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-requests.html'
};
