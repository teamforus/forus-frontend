let FundRequestsComponent = function(
    $q,
    $scope,
    $state,
    $timeout,
    FileService,
    FundService,
    ModalService,
    DateService,
    OrganizationService,
    OrganizationEmployeesService,
    FundRequestValidatorService,
    PushNotificationsService,
    appConfigs
) {
    let $ctrl = this;

    let showInfoModal = (title, message) => ModalService.open('modalNotification', {
        type: 'info',
        title: title,
        description: message,
        modalClass: 'modal-md',
    });

    let org = OrganizationService.active();

    $ctrl.funds = [];
    $ctrl.fundsById = {};
    $ctrl.validatorRequests = null;
    $ctrl.employee = false;

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

    $ctrl.reloadRequest = (request) => {
        FundRequestValidatorService.read(
            $ctrl.organization.id,
            request.id
        ).then((res) => {
            res.data.data.hasContent = request.hasContent;
            res.data.data.collapsed = request.collapsed;

            request.records.forEach((record) => {
                let newRecord = res.data.data.records.filter(_record => _record.id == record.id)[0];

                if (newRecord) {
                    newRecord.shown = record.shown
                }
            });

            $ctrl.validatorRequests.data[$ctrl.validatorRequests.data.indexOf(request)] = res.data.data;
            $ctrl.validatorRequests = $ctrl.updateSelfAssignedFlags($ctrl.validatorRequests);
        }, console.error);
    };

    let reloadRequests = (query) => {
        FundRequestValidatorService.indexAll($ctrl.organization.id, {
            ...query,
            ...{
                from: query.from ? DateService._frontToBack(query.from) : null,
                to: query.to ? DateService._frontToBack(query.to) : null,
            }
        }).then(function(res) {
            $ctrl.validatorRequests = $ctrl.updateSelfAssignedFlags(res.data);
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
            title: 'Weet u zeker dat u deze eigenschap wil goedkeuren?',
            description: 'Een beoordeling kan niet ongedaan gemaakt worden. Kijk goed of u deze actie wilt verrichten.',
            confirm: (res) => {
                FundRequestValidatorService.approveRecord(
                    $ctrl.organization.id,
                    request.id,
                    requestRecord.id
                ).then(() => {
                    $ctrl.reloadRequest(request);
                    showInfoModal('Eigenschap gevalideert');
                }, res => showInfoModal('Fout: U kunt deze eigenschap op dit moment niet beoordelen.', res.data.message));
            }
        });
    };

    $ctrl.declineRecord = (request, requestRecord) => {
        ModalService.open('fundRequestRecordDecline', {
            organization: $ctrl.organization,
            requestRecord: requestRecord,
            submit: (err) => {
                if (err) {
                    return showInfoModal(
                        'U kunt op dit moment deze eigenschap niet weigeren.',
                        'Reden: ' + err.data.message
                    );
                }

                $ctrl.reloadRequest(request);
                showInfoModal('Eigenschap geweigerd.');
            }
        });
    };

    $ctrl.clarifyRecord = (request, requestRecord) => {
        ModalService.open('fundRequestRecordClarify', {
            organization: $ctrl.organization,
            requestRecord: requestRecord,
            submit: (err) => {
                if (err) {
                    return showInfoModal(
                        "U kunt op dit moment geen aanvullingsverzoek doen.",
                        'Reason: ' + res.data.message
                    );
                }

                $ctrl.reloadRequest(request);
                showInfoModal('Gelukt! Aanvullingsverzoek op aanvraag verstuurd.');
            }
        });
    };

    $ctrl.requestApprove = (request) => {
        FundRequestValidatorService.approve($ctrl.organization.id, request.id).then(() => {
            $ctrl.reloadRequest(request);
        }, (res) => {
            showInfoModal(
                'Validatie van eigenschap mislukt.',
                'Reden: ' + res.data.message
            );
        });
    };

    $ctrl.requestDecline = (request) => {
        ModalService.open('fundRequestRecordsDecline', {
            organization: $ctrl.organization,
            request: request,
            submit: (err) => {
                if (err) {
                    return showInfoModal(
                        'U kunt op dit moment deze aanvragen niet weigeren.',
                        'Reden: ' + err.data.message
                    );
                }

                $ctrl.reloadRequest(request);
                PushNotificationsService.success('Gelukt! Aanvraag is geweigerd');
            }
        });
    };

    $ctrl.requestDisregard = (request) => {
        ModalService.open('fundRequestDisregard', {
            organization: $ctrl.organization,
            request: request,
            submit: (err) => {
                if (err) {
                    return showInfoModal(
                        'U kunt op dit moment deze aanvragen niet weigeren.',
                        'Reden: ' + err.data.message
                    );
                }

                $ctrl.reloadRequest(request);
                PushNotificationsService.success('Gelukt! Aanvraag is niet behandelen');
            }
        });
    };

    $ctrl.requestDisregardUndo = (request) => {
        ModalService.open('fundRequestDisregardUndo', {
            organization: $ctrl.organization,
            request: request,
            submit: (err) => {
                if (err) {
                    return showInfoModal(
                        'U kunt op dit moment deze aanvragen niet weigeren.',
                        'Reden: ' + err.data.message
                    );
                }

                $ctrl.reloadRequest(request);
                PushNotificationsService.success('Gelukt! Aanvraag is niet behandelen');
            }
        });
    };

    $ctrl.requestAssign = (request) => {
        FundRequestValidatorService.assign(
            $ctrl.organization.id,
            request.id
        ).then(() => {
            PushNotificationsService.success('Gelukt! U bent nu toegewezen aan deze aanvraag.');
            $ctrl.reloadRequest(request);
        }, res => {
            PushNotificationsService.danger('U kunt op dit moment geen aanvullingsverzoek doen.');
            console.error(res);
        });
    };

    $ctrl.requestResign = (request) => {
        FundRequestValidatorService.resign(
            $ctrl.organization.id,
            request.id
        ).then(() => {
            PushNotificationsService.success('Gelukt! U heeft zich afgemeld van deze aanvraag.');
            $ctrl.reloadRequest(request);
        }, res => {
            PushNotificationsService.danger('Mislukt! U kunt u zelf niet van deze aanvraag afhalen.');
            console.error(res);
        })
    };

    $ctrl.updateSelfAssignedFlags = (validatorRequests) => {
        if (!$ctrl.employee || !validatorRequests) {
            return;
        }

        validatorRequests.data.forEach(request => {
            request.hasContent = request.records.filter(record => {
                return record.files.length > 0 || record.clarifications.length > 0;
            }).length > 0;

            request.record_types = request.records.map(record => record.record_type_key);
            request.records.forEach(record => record.shown = true);
            request.collapsed = request.state != 'pending' && request.state != 'disregarded';

            request.is_assignable = request.records.filter(
                record => record.is_assignable
            ).length > 0;

            request.is_assigned = request.records.filter(
                record => record.is_assigned && (
                    record.state === 'pending' || record.state === 'disregarded'
                )
            ).length > 0;
        });

        return validatorRequests;
    };

    $ctrl.appendRecord = (fundRequest) => {
        ModalService.open('fundAppendRequestRecord', {
            fundRequest: fundRequest,
            organization: $ctrl.organization,
            onAppend: () => {
                PushNotificationsService.success('Gelukt! Eigenschap toegevoegd.');
                reloadRequests($ctrl.filters.values);
            }
        });
    };

    $ctrl.$onInit = function() {
        $q((resolve) => {
            let userReady = false;
            let fundsReady = false;
            let configsReady = false;

            let update = () => {
                if (userReady && fundsReady && configsReady) {
                    resolve();
                }
            };

            FundService.list($ctrl.organization.id, {
                per_page: 100
            }).then(res => {
                $ctrl.funds = res.data.data;
                $ctrl.funds.forEach(fund => $ctrl.fundsById[fund.id] = fund);
                fundsReady = true;
                update();
            });

            let authUnwatch = $scope.$watch(() => $scope.$root.auth_user, (auth_user) => {
                if (auth_user) {
                    userReady = true;
                    authUnwatch();
                    update();
                }
            });

            let configUnwatch = $scope.$watch(() => appConfigs.features, (features) => {
                if (features && !features.organizations.funds.fund_requests) {
                    return $state.go('csv-validation');
                }

                if (features) {
                    configsReady = true;
                    configUnwatch();
                    update();
                }
            });
        }).then(() => {
            $ctrl.filters.reset();

            OrganizationEmployeesService.list($ctrl.organization.id, {
                per_page: 100,
                role: 'validation',
            }).then(res => {
                $ctrl.employees = res.data.data;
                $ctrl.employee = res.data.data.filter((employee) => {
                    return employee.identity_address == $scope.$root.auth_user.address;
                })[0];

                $ctrl.employees.unshift({
                    id: null,
                    email: "Selecteer medewerker"
                });

                $ctrl.filters.values.employee_id = $ctrl.employees[0].id;
                reloadRequests($ctrl.filters.values);
            });
        });
    };

    $ctrl.downloadFile = (file) => {
        FileService.download(file).then(res => {
            FileService.downloadFile(file.original_name, res.data);
        }, console.error);
    };

    $ctrl.exportRequests = () => {
        ModalService.open('exportType', {
            success: (data) => {
                FundRequestValidatorService.exportAll(
                    $ctrl.organization.id,
                    Object.assign($ctrl.filters.values, {
                        export_format: data.exportType
                    })
                ).then((res => {
                    FileService.downloadFile(
                        appConfigs.panel_type + '_' + org + '_' + moment().format(
                            'YYYY-MM-DD HH:mm:ss'
                        ) + '.' + data.exportType,
                        res.data,
                        res.headers('Content-Type') + ';charset=utf-8;'
                    );
                }), console.error);
            }
        });
    };

    $ctrl.hasFilePreview = (file) => {
        return ['pdf', 'png', 'jpeg', 'jpg'].includes(file.ext);
    }

    $ctrl.previewFile = ($event, file) => {
        $event.originalEvent.preventDefault();
        $event.originalEvent.stopPropagation();

        if (file.ext == 'pdf') {
            FileService.download(file).then(res => {
                ModalService.open('pdfPreview', {
                    rawPdfFile: res.data
                });
            }, console.error);
        } else if (['png', 'jpeg', 'jpg'].includes(file.ext)) {
            ModalService.open('imagePreview', {
                imageSrc: file.url
            });
        }
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
        '$q',
        '$scope',
        '$state',
        '$timeout',
        'FileService',
        'FundService',
        'ModalService',
        'DateService',
        'OrganizationService',
        'OrganizationEmployeesService',
        'FundRequestValidatorService',
        'PushNotificationsService',
        'appConfigs',
        FundRequestsComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-requests.html'
};
