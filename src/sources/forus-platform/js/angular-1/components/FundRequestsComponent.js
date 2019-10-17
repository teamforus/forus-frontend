let FundRequestsComponent = function(
    $scope,
    $state,
    $timeout,
    FileService,
    FundService,
    ModalService,
    OrganizationEmployeesService,
    FundRequestValidatorService,
    appConfigs
) {
    let $ctrl = this;

    let showInfoModal = (title, message) => ModalService.open('modalNotification', {
        type: 'info',
        title: title,
        description: message,
    });

    $ctrl.funds = [];
    $ctrl.fundsById = {};
    $ctrl.validatorRequests = null;
    $ctrl.employee = false;

    let statePriority = {
        pending: 1,
        approved: 0,
        declined: -1
    };

    $ctrl.shownUsers = {};

    $ctrl.states = [{
        key: null,
        name: 'Alle'
    }, {
        key: 'approved',
        name: 'Geaccepteerd'
    }, {
        key: 'declined',
        name: 'Geweigerd'
    }, {
        key: 'pending',
        name: 'Wachtend'
    }];

    $ctrl.filters = {
        show: false,
        values: {},
        reset: function() {
            $ctrl.filters.values.q = '';
            $ctrl.filters.values.state = $ctrl.states[0].key;
        }
    };

    $ctrl.resetFilters = () => {
        $ctrl.filters.reset();
    };

    $ctrl.hideFilters = () => {
        $timeout(() => $ctrl.filters.show = false);
    };

    let reloadRequests = (query = false) => {
        if (query) {
            $ctrl.filters.values = query;
        }

        FundRequestValidatorService.indexAll(
            $ctrl.organization.id,
            $ctrl.filters.values
        ).then(function(res) {
            $ctrl.validatorRequests = res.data;
            $ctrl.validatorRequests.data.forEach(request => {
                request.collapsed = request.state != 'pending';
            });
            $ctrl.updateSelfAssignedFlags();

            $ctrl.validatorRequests.data.forEach(request => {
                request.hasContent = request.records.filter(record => {
                    return record.files.length > 0 || record.clarifications.length > 0;
                }).length > 0;
            });
        }, console.error);
    };

    $ctrl.showFundCriteria = (e, validatorRequest) => {
        e.originalEvent.stopPropagation();
        validatorRequest.showCriteria = true;
    };

    $ctrl.hideFundCriteria = (e, validatorRequest) => {
        e.stopPropagation();
        e.preventDefault();
        $timeout(() => validatorRequest.showCriteria = false, 0);
    };

    $ctrl.approveRecord = (request, requestRecord) => {
        ModalService.open('modalNotification', {
            modalClass: 'modal-md',
            type: 'confirm',
            title: 'Do you confirm record approvment?',
            description: 'Pellentesque elementum magnis massa eget cras pretium montes.',
            confirm: (res) => {
                FundRequestValidatorService.approveRecord(
                    $ctrl.fundsById[request.fund_id].organization_id,
                    request.fund_id,
                    request.id,
                    requestRecord.id
                ).then(res => {
                    $state.reload();
                    showInfoModal('Record approved.')
                }, res => showInfoModal('Can\'t approve record.', res.data.message));
            }
        });
    };

    $ctrl.declineRecord = (request, requestRecord) => {
        ModalService.open('fundRequestRecordDecline', {
            fund: $ctrl.fundsById[request.fund_id],
            requestRecord: requestRecord,
            submit: (err) => {
                if (err) {
                    return showInfoModal(
                        'Can\'t decline record.',
                        'Reason: ' + err.data.message
                    );
                }

                $state.reload();
                showInfoModal('Record declined.')
            }
        });
    };

    $ctrl.clarifyRecord = (request, requestRecord) => {
        ModalService.open('fundRequestRecordClarify', {
            fund: $ctrl.fundsById[request.fund_id],
            requestRecord: requestRecord,
            submit: (err) => {
                if (err) {
                    return showInfoModal(
                        "Can't request clarification for the record.",
                        'Reason: ' + res.data.message
                    );
                }

                $state.reload();
                showInfoModal('Record clarification requested.')
            }
        });
    };

    $ctrl.requestApprove = (request) => {
        FundRequestValidatorService.approve(
            $ctrl.fundsById[request.fund_id].organization_id,
            request.fund_id,
            request.id
        ).then(() => $state.reload(), (res) => {
            showInfoModal(
                'Request approvement failed.',
                'Reason: ' + res.data.message
            );
        });
    }

    $ctrl.requestDecline = (request) => {
        FundRequestValidatorService.decline(
            $ctrl.fundsById[request.fund_id].organization_id,
            request.fund_id,
            request.id
        ).then(() => $state.reload(), (res) => {
            showInfoModal(
                'Request declining failed.',
                'Reason: ' + res.data.message
            );
        });
    }

    $ctrl.requestAssign = (request) => {
        FundRequestValidatorService.assign(
            $ctrl.fundsById[request.fund_id].organization_id,
            request.fund_id,
            request.id,
            $ctrl.employee.id
        ).then(() => {
            $state.reload();
            showInfoModal("Done!", "Now you are the validator of this request.")
        }, res => showInfoModal(
            "Can't request clarification for the record.",
            res.data.error.message
        ));
    };

    $ctrl.requestResign = (request) => {
        FundRequestValidatorService.resign(
            $ctrl.fundsById[request.fund_id].organization_id,
            request.fund_id,
            request.id
        ).then(() => {
            $state.reload();
            showInfoModal("Done!", "You successifully resigned from validation request.")
        }, res => showInfoModal(
            "Can't resign from the record.",
            res.data.error.message
        ));
    };

    $ctrl.updateSelfAssignedFlags = () => {
        if (!$ctrl.employee || !$ctrl.validatorRequests) {
            return;
        }

        $ctrl.validatorRequests.data.forEach(request => {
            request.self_assigned = request.employee_id == $ctrl.employee.id;
        });
    };

    $ctrl.$onInit = function() {
        OrganizationEmployeesService.list($ctrl.organization.id).then(res => {
            $ctrl.employee = res.data.data.filter((employee) => {
                return employee.identity_address == $scope.$root.auth_user.address;
            })[0];
        });

        FundService.list($ctrl.organization.id, {
            per_page: 10000
        }).then(res => {
            $ctrl.funds = res.data.data;
            $ctrl.funds.forEach(fund => $ctrl.fundsById[fund.id] = fund);
        });

        $scope.$watch(() => {
            return $scope.$root.auth_user;
        }, (res) => {
            if (!res) {
                return;
            }

            OrganizationEmployeesService.list($ctrl.organization.id).then(res => {
                $ctrl.employee = res.data.data.filter((employee) => {
                    return employee.identity_address == $scope.$root.auth_user.address;
                })[0];

                $ctrl.updateSelfAssignedFlags();
            });
        });

        $scope.$watch(() => {
            return appConfigs.features;
        }, (res) => {
            if (!res) {
                return;
            }

            if (!appConfigs.features.validationRequests) {
                return $state.go('csv-validation');
            }

            $ctrl.filters.reset();
            reloadRequests();
        });
    };

    $ctrl.downloadFile = (file) => {
        FileService.download(file).then(res => {
            FileService.downloadFile(file.original_name, res.data);
        }, console.error);
    };


    $ctrl.onPageChange = (query) => {
        reloadRequests(query);
    };
};

module.exports = {
    bindings: {
        appConfigs: '<',
        organization: '<',
    },
    controller: [
        '$scope',
        '$state',
        '$timeout',
        'FileService',
        'FundService',
        'ModalService',
        'OrganizationEmployeesService',
        'FundRequestValidatorService',
        'appConfigs',
        FundRequestsComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-requests.html'
};