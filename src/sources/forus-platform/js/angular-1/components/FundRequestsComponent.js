const FundRequestsComponent = function(
    $state,
    $timeout,
    FileService,
    ModalService,
    DateService,
    FundRequestValidatorService,
    PushNotificationsService,
    PersonBSNService,
    PageLoadingBarService,
    appConfigs
) {
    const $ctrl = this;

    const showInfoModal = (title, message) => ModalService.open('modalNotification', {
        type: 'info',
        title: title,
        description: message,
        modalClass: 'modal-md',
    });

    const reloadRequests = (query) => {
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

    const setBreadcrumbs = (validatorRequest, parent) => {
        if (parent) {
            let parentIndex = validatorRequest.person_breadcrumbs.findIndex(
                (breadcrumb) => breadcrumb.bsn === parent
            );
            if (parentIndex !== -1) {
                validatorRequest.person_breadcrumbs.splice(parentIndex + 1);
            }

            let index = validatorRequest.person_breadcrumbs.findIndex(
                (breadcrumb) => breadcrumb.bsn === validatorRequest.person.bsn
            );
            if (index !== -1) {
                validatorRequest.person_breadcrumbs.splice(index + 1);
            } else if (parent !== validatorRequest.person.bsn) {
                validatorRequest.person_breadcrumbs.push(validatorRequest.person);
            }

            return;
        }

        validatorRequest.person_breadcrumbs = [];
        validatorRequest.person_breadcrumbs.push(validatorRequest.person);
    }


    $ctrl.funds = [];
    $ctrl.employee = false;
    $ctrl.validatorRequests = null;
    $ctrl.isValidatorsSupervisor = false;

    $ctrl.persons = {};
    $ctrl.fetchingPerson = false;

    $ctrl.shownUsers = {};
    $ctrl.extendedView = localStorage.getItem('validator_requests.extended_view') === 'true';

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

    $ctrl.setExtendedView = function(extendedView) {
        localStorage.setItem('validator_requests.extended_view', extendedView);

        $ctrl.extendedView = extendedView;
        $ctrl.validatorRequests.data.forEach((request) => request.collapsed = $ctrl.extendedView);
    };

    $ctrl.reloadRequest = (request) => {
        FundRequestValidatorService.read(
            $ctrl.organization.id,
            request.id
        ).then((res) => {
            res.data.data.hasContent = request.hasContent;
            res.data.data.collapsed = request.collapsed;
            res.data.data.person = request.person;
            res.data.data.person_breadcrumbs = request.person_breadcrumbs;

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
                    PushNotificationsService.success('Gelukt!', 'Eigenschap gevalideert.');
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
                PushNotificationsService.success('Gelukt!', 'Eigenschap geweigerd.');
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
                PushNotificationsService.success('Gelukt!', 'Aanvullingsverzoek op aanvraag verstuurd.');
            }
        });
    };

    $ctrl.requestApprove = (request) => {
        ModalService.open('modalNotification', {
            modalClass: 'modal-md',
            type: 'confirm',
            title: 'Weet u zeker dat u deze eigenschap wil goedkeuren?',
            description: 'Een beoordeling kan niet ongedaan gemaakt worden. Kijk goed of u deze actie wilt verrichten.',
            confirm: () => {
                FundRequestValidatorService.approve($ctrl.organization.id, request.id).then(() => {
                    $ctrl.reloadRequest(request);
                }, (res) => {
                    showInfoModal(
                        'Validatie van eigenschap mislukt.',
                        'Reden: ' + res.data.message
                    );
                });
            }
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
                PushNotificationsService.success('Gelukt!', 'Aanvraag is geweigerd.');
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
                PushNotificationsService.success('Gelukt!', 'Aanvraag is niet behandelen.');
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
                PushNotificationsService.success('Gelukt!', 'Aanvraag is niet behandelen.');
            }
        });
    };

    $ctrl.assignRequest = (request) => {
        FundRequestValidatorService.assign($ctrl.organization.id, request.id).then(() => {
            PushNotificationsService.success('Gelukt!', 'U bent nu toegewezen aan deze aanvraag.');
            $ctrl.reloadRequest(request);
        }, res => {
            PushNotificationsService.danger('Mislukt!', 'U kunt op dit moment geen aanvullingsverzoek doen.');
            console.error(res);
        });
    };

    $ctrl.assignRequestAsSupervisor = (fundRequest) => {
        ModalService.open('fundRequestAssignValidator', {
            fundRequest: fundRequest,
            organization: $ctrl.organization,
            employees: $ctrl.employees.data.filter((employee) => {
                return employee.id && employee.identity_address != $ctrl.authUser.address;
            }),
            confirm: () => {
                PushNotificationsService.success('Gelukt!', 'Eigenschap toegevoegd.');
                reloadRequests($ctrl.filters.values);
            }
        });
    };

    $ctrl.requestResign = (request) => {
        if (!request.can_resign) {
            return $ctrl.requestResignAllEmployeesAsSupervisor(request);
        }

        FundRequestValidatorService.resign($ctrl.organization.id, request.id).then(() => {
            PushNotificationsService.success('Gelukt!', 'U heeft zich afgemeld van deze aanvraag.');
            $ctrl.reloadRequest(request);
        }, res => {
            PushNotificationsService.danger('Mislukt!', 'U kunt u zelf niet van deze aanvraag afhalen.');
            console.error(res);
        })
    };

    $ctrl.requestResignAllEmployeesAsSupervisor = (request) => {
        FundRequestValidatorService.requestResignAllEmployeesAsSupervisor($ctrl.organization.id, request.id).then(() => {
            PushNotificationsService.success('Gelukt!', 'U heeft zich afgemeld van deze aanvraag.');
            $ctrl.reloadRequest(request);
        }, res => {
            PushNotificationsService.danger('Mislukt!', 'Error');
            console.error(res);
        })
    };

    $ctrl.updateSelfAssignedFlags = (validatorRequests) => {
        validatorRequests.data.forEach((request) => {
            const { state, records, replaced, allowed_employees } = request;
            const isPending = state == 'pending';

            const recordTypes = records.map((record) => record.record_type_key);
            const pendingRecords = records.filter((record) => record.state == 'pending');
            const assignedRecords = records.filter((record) => record.employee?.identity_address === $ctrl.authUser.address);
            const assignableRecords = pendingRecords.filter((record) => record.is_assignable);

            const assignedPendingRecords = assignedRecords.filter((record) => record.state === 'pending');
            const assignedDisregardedRecords = assignedRecords.filter((record) => record.state === 'disregarded');

            const isSponsorEmployee = $ctrl.organization.id === request.fund.organization_id;
            const hasAssignableRecords = assignableRecords.length > 0;
            const hasAssignableEmployees = allowed_employees.filter((employee) => employee.id !== $ctrl.employee?.id).length > 0;

            const isAssigned = assignedPendingRecords.length > 0 || assignedDisregardedRecords.length > 0;
            const hasPartnerBSN = recordTypes.includes('partner_bsn');
            const canAddPartnerBsn = isSponsorEmployee && $ctrl.organization.bsn_enabled && request.is_assigned && !hasPartnerBSN;

            const hasPendingInternallyAssignedRecords = pendingRecords.filter((record) => {
                return record.employee?.organization_id === $ctrl.organization.id;
            }).length > 0;

            request.records = request.records.map((record) => ({ ...record, shown: true }));
            request.collapsed = $ctrl.extendedView;
            request.hasContent = records.filter((record) => record.files?.length || record.clarifications?.length).length > 0;

            request.can_disregarded = isPending && isSponsorEmployee && assignedPendingRecords.length;
            request.can_disregarded_undo = isPending && isSponsorEmployee && (assignedDisregardedRecords.length > 0) && !replaced;

            request.is_assignable = isPending && hasAssignableRecords;
            request.is_sponsor_employee = isSponsorEmployee;
            request.is_assignable_as_supervisor = isPending && hasAssignableEmployees && $ctrl.isValidatorsSupervisor;

            request.is_assigned = isAssigned;
            request.can_add_partner_bsn = canAddPartnerBsn;

            request.can_resign = assignedPendingRecords.length > 0 && assignedDisregardedRecords.length == 0;
            request.can_resign_as_supervisor = isPending && $ctrl.isValidatorsSupervisor && hasPendingInternallyAssignedRecords;
        });

        return validatorRequests;
    };

    $ctrl.appendRecord = (fundRequest) => {
        ModalService.open('fundAppendRequestRecord', {
            fundRequest: fundRequest,
            organization: $ctrl.organization,
            onAppend: () => {
                PushNotificationsService.success('Gelukt!', 'Eigenschap toegevoegd.');
                reloadRequests($ctrl.filters.values);
            }
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

    $ctrl.hasFilePreview = (file) => {
        return ['pdf', 'png', 'jpeg', 'jpg'].includes(file.ext);
    }

    $ctrl.previewFile = ($event, file) => {
        $event.originalEvent.preventDefault();
        $event.originalEvent.stopPropagation();

        if (file.ext == 'pdf') {
            FileService.download(file).then(res => {
                ModalService.open('pdfPreview', { rawPdfFile: res.data });
            }, console.error);
        } else if (['png', 'jpeg', 'jpg'].includes(file.ext)) {
            ModalService.open('imagePreview', { imageSrc: file.url });
        }
    };
    
    $ctrl.getPerson = (validatorRequest, bsn, parent = null) => {
        if (!bsn || $ctrl.fetchingPerson) {
            return;
        }
    
        $ctrl.fetchingPerson = true;
    
        if ($ctrl.persons[bsn]) {
            validatorRequest.person = $ctrl.persons[bsn];
            validatorRequest.bsn_collapsed = false;
            setBreadcrumbs(validatorRequest, parent);
            $ctrl.fetchingPerson = false;
            return;
        }
    
        PageLoadingBarService.setProgress(0);
    
        PersonBSNService.read($ctrl.organization.id, bsn).then(
            (res) => {
                $ctrl.persons[bsn] = res.data.data;
                validatorRequest.person = $ctrl.persons[bsn];
                validatorRequest.bsn_collapsed = false;
                setBreadcrumbs(validatorRequest, parent);
                PageLoadingBarService.setProgress(100);
                $ctrl.fetchingPerson = false;
            },
            (res) => {
                PageLoadingBarService.setProgress(100);
                $ctrl.fetchingPerson = false;
                if (res.status === 404) {
                    // not found message
                }
            }
        );
    };

    $ctrl.onPageChange = (query) => {
        reloadRequests(query);
    };

    $ctrl.$onInit = function() {
        if (!appConfigs.features.organizations.funds.fund_requests) {
            return $state.go('csv-validation');
        }

        $ctrl.isValidatorsSupervisor = $ctrl.organization.permissions.includes('manage_validators');

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
        employee: '<',
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
        'PushNotificationsService',
        'PersonBSNService',
        'PageLoadingBarService',
        'appConfigs',
        FundRequestsComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-requests.html'
};
