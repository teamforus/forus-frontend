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
        modalClass: 'modal-md',
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

    $ctrl.reloadRequest = (request) => {
        FundRequestValidatorService.read(
            $ctrl.organization.id,
            request.fund_id,
            request.id
        ).then((res) => {
            res.data.data.hasContent = request.hasContent;
            res.data.data.collapsed = request.collapsed;

            request.records.forEach((record, index) => {
                res.data.data.records[index].shown = record.shown;
            });

            $ctrl.validatorRequests.data[
                $ctrl.validatorRequests.data.indexOf(request)
            ] = res.data.data;

            $ctrl.updateSelfAssignedFlags();
        }, console.error);
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
            title: 'Weet u zeker dat u deze eigenschap wil valideren?',
            description: 'Een validatie kan niet ongedaan gemaakt worden. Kijk goed of u deze actie wilt verrichten.',
            confirm: (res) => {
                FundRequestValidatorService.approveRecord(
                    $ctrl.fundsById[request.fund_id].organization_id,
                    request.fund_id,
                    request.id,
                    requestRecord.id
                ).then(() => {
                    $ctrl.reloadRequest(request);
                    showInfoModal('Eigenschap gevalideert')
                }, res => showInfoModal('Fout: U kunt deze eigenschap op dit moment niet valideren', res.data.message));
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
                        'U kunt op dit moment deze eigenschap niet weigeren.',
                        'Reden: ' + err.data.message
                    );
                }

                $ctrl.reloadRequest(request);
                showInfoModal('Eigenschap geweigerd.')
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
                        "U kunt op dit moment geen aanvullingsverzoek doen.",
                        'Reason: ' + res.data.message
                    );
                }

                $ctrl.reloadRequest(request);
                showInfoModal('Gelukt! Aanvullingsverzoek op aanvraag verstuurd.')
            }
        });
    };

    $ctrl.requestApprove = (request) => {
        FundRequestValidatorService.approve(
            $ctrl.fundsById[request.fund_id].organization_id,
            request.fund_id,
            request.id
        ).then(() => {
            $ctrl.reloadRequest(request);
        }, (res) => {
            showInfoModal(
                'Validatie van eigenschap mislukt.',
                'Reden: ' + res.data.message
            );
        });
    }

    $ctrl.requestDecline = (request) => {
        FundRequestValidatorService.decline(
            $ctrl.fundsById[request.fund_id].organization_id,
            request.fund_id,
            request.id
        ).then(() => {
            $ctrl.reloadRequest(request);
        }, (res) => {
            showInfoModal(
                'Aanvraag weigeren mislukt.',
                'Reden:' + res.data.message
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
            showInfoModal("Gelukt!", "U bent nu toegewezen aan deze aanvraag.")
            $ctrl.reloadRequest(request);
        }, res => showInfoModal(
            "U kunt op dit moment geen aanvullingsverzoek doen.",
            res.data.error.message
        ));
    };

    $ctrl.requestResign = (request) => {
        FundRequestValidatorService.resign(
            $ctrl.fundsById[request.fund_id].organization_id,
            request.fund_id,
            request.id
        ).then(() => {
            showInfoModal("Gelukt!", "U heeft zich afgemeld van deze aanvraag, iemand anders kan deze aanvraag nu oppakken.")
            $ctrl.reloadRequest(request);
        }, res => showInfoModal(
            "Mislukt! U kunt u zelf niet van deze aanvraag afhalen.",
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

            if (!appConfigs.features.organizations.funds.fund_requests) {
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

    $ctrl.previewFile = ($event, file) => {
        $event.originalEvent.preventDefault();
        $event.originalEvent.stopPropagation();

        FileService.download(file).then(res => {
            ModalService.open('modalPdfPreview', {
                rawPdfFile: res.data
            });
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