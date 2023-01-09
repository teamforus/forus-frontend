const FundRequestsShowComponent = function(
    $state,
    $timeout,
    FileService,
    ModalService,
    PushNotificationsService,
    FundRequestValidatorService,
    appConfigs
) {
    const $ctrl = this;

    const showInfoModal = (title, message) => ModalService.open('modalNotification', {
        type: 'info',
        title: title,
        description: message,
        modalClass: 'modal-md',
    });

    const setRequestFlags = () => {
        const { state, records, replaced, allowed_employees } = $ctrl.validatorRequest;
        const isPending = state == 'pending';

        const recordTypes = records.map((record) => record.record_type_key);
        const pendingRecords = records.filter((record) => record.state == 'pending');
        const assignedRecords = records.filter((record) => record.employee?.identity_address === $ctrl.authUser.address);
        const assignableRecords = pendingRecords.filter((record) => record.is_assignable);

        const assignedPendingRecords = assignedRecords.filter((record) => record.state === 'pending');
        const assignedDisregardedRecords = assignedRecords.filter((record) => record.state === 'disregarded');

        const isSponsorEmployee = $ctrl.organization.id === $ctrl.validatorRequest.fund.organization_id;
        const hasAssignableRecords = assignableRecords.length > 0;
        const hasAssignableEmployees = allowed_employees.filter((employee) => employee.id !== $ctrl.employee?.id).length > 0;

        const isAssigned = assignedPendingRecords.length > 0 || assignedDisregardedRecords.length > 0;
        const hasPartnerBSN = recordTypes.includes('partner_bsn');
        const canAddPartnerBsn = isSponsorEmployee && $ctrl.organization.bsn_enabled && isAssigned && !hasPartnerBSN;

        const hasPendingInternallyAssignedRecords = pendingRecords.filter((record) => {
            return record.employee?.organization_id === $ctrl.organization.id;
        }).length > 0;

        $ctrl.validatorRequest.records = $ctrl.validatorRequest.records.map((record) => ({ ...record, shown: true }));
        $ctrl.validatorRequest.collapsed = $ctrl.extendedView;
        $ctrl.validatorRequest.hasContent = records.filter((record) => record.files?.length || record.clarifications?.length).length > 0;

        $ctrl.validatorRequest.can_disregarded = isPending && isSponsorEmployee && assignedPendingRecords.length;
        $ctrl.validatorRequest.can_disregarded_undo = isSponsorEmployee && (assignedDisregardedRecords.length > 0) && !replaced;

        $ctrl.validatorRequest.is_assignable = isPending && hasAssignableRecords;
        $ctrl.validatorRequest.is_sponsor_employee = isSponsorEmployee;
        $ctrl.validatorRequest.is_assignable_as_supervisor = isPending && hasAssignableEmployees && $ctrl.isValidatorsSupervisor;

        $ctrl.validatorRequest.is_assigned = isAssigned;
        $ctrl.validatorRequest.can_add_partner_bsn = canAddPartnerBsn;

        $ctrl.validatorRequest.can_resign = assignedPendingRecords.length > 0 && assignedDisregardedRecords.length == 0;
        $ctrl.validatorRequest.can_resign_as_supervisor = isPending && $ctrl.isValidatorsSupervisor && hasPendingInternallyAssignedRecords;

        $ctrl.validatorRequest.fund.criteria = $ctrl.validatorRequest.fund.criteria.map((criterion) => {
            const operator = { '>': 'moet meer dan', '<': 'moet minder dan' }[criterion.operator] || 'moet';
            const value = `${criterion.record_type_key === 'net_worth' ? '€' : ''}${criterion.value}`;

            return { ...criterion, description: `${criterion.record_type_name} ${operator} ${value}.` };
        });
    };

    $ctrl.funds = [];
    $ctrl.employee = false;
    $ctrl.validatorRequest = null;
    $ctrl.isValidatorsSupervisor = false;
    $ctrl.showCriteria = false;

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

    $ctrl.reloadRequest = () => {
        FundRequestValidatorService.read($ctrl.organization.id, $ctrl.validatorRequest.id).then((res) => {
            res.data.data.hasContent = $ctrl.validatorRequest.hasContent;
            res.data.data.person = $ctrl.validatorRequest.person;
            res.data.data.person_relative = $ctrl.validatorRequest.person_relative;
            res.data.data.person_breadcrumbs = $ctrl.validatorRequest.person_breadcrumbs;

            $ctrl.validatorRequest.records.forEach((record) => {
                let newRecord = res.data.data.records.filter(_record => _record.id == record.id)[0];

                if (newRecord) {
                    newRecord.shown = record.shown
                }
            });

            $ctrl.validatorRequest = res.data.data;
            setRequestFlags();
        }, console.error);
    };

    $ctrl.showFundCriteria = (e) => {
        e.originalEvent.stopPropagation();
        $ctrl.showCriteria = true;
    };

    $ctrl.hideFundCriteria = (e) => {
        e.stopPropagation();
        e.preventDefault();
        $timeout(() => $ctrl.showCriteria = false, 0);
    };

    $ctrl.approveRecord = (requestRecord) => {
        ModalService.open('modalNotification', {
            modalClass: 'modal-md',
            type: 'confirm',
            title: 'Weet u zeker dat u deze eigenschap wil goedkeuren?',
            description: 'Een beoordeling kan niet ongedaan gemaakt worden. Kijk goed of u deze actie wilt verrichten.',
            confirm: () => {
                FundRequestValidatorService.approveRecord(
                    $ctrl.organization.id,
                    $ctrl.validatorRequest.id,
                    requestRecord.id
                ).then(() => {
                    $ctrl.reloadRequest();
                    PushNotificationsService.success('Gelukt!', 'Eigenschap gevalideert.');
                }, res => showInfoModal('Fout: U kunt deze eigenschap op dit moment niet beoordelen.', res.data.message));
            }
        });
    };

    $ctrl.declineRecord = (requestRecord) => {
        ModalService.open('fundRequestRecordDecline', {
            organization: $ctrl.organization,
            fundRequest: $ctrl.validatorRequest,
            requestRecord: requestRecord,
            submit: (err) => {
                if (err) {
                    return showInfoModal(
                        'U kunt op dit moment deze eigenschap niet weigeren.',
                        'Reden: ' + err.data.message
                    );
                }

                $ctrl.reloadRequest();
                PushNotificationsService.success('Gelukt!', 'Eigenschap geweigerd.');
            }
        });
    };

    $ctrl.clarifyRecord = (requestRecord) => {
        ModalService.open('fundRequestRecordClarify', {
            fundRequest: $ctrl.validatorRequest,
            organization: $ctrl.organization,
            requestRecord: requestRecord,
            submit: (res) => {
                if (res) {
                    return showInfoModal("Error", 'Reason: ' + res.data.message);
                }

                $ctrl.reloadRequest();
                PushNotificationsService.success('Gelukt!', 'Aanvullingsverzoek op aanvraag verstuurd.');
            }
        });
    };

    $ctrl.requestApprove = () => {
        ModalService.open('modalNotification', {
            modalClass: 'modal-md',
            type: 'confirm',
            title: 'Weet u zeker dat u deze eigenschap wil goedkeuren?',
            description: 'Een beoordeling kan niet ongedaan gemaakt worden. Kijk goed of u deze actie wilt verrichten.',
            confirm: () => {
                FundRequestValidatorService.approve($ctrl.organization.id, $ctrl.validatorRequest.id).then(() => {
                    $ctrl.reloadRequest();
                }, (res) => {
                    showInfoModal(
                        'Validatie van eigenschap mislukt.',
                        'Reden: ' + res.data.message
                    );
                });
            }
        });
    };

    $ctrl.requestDecline = () => {
        ModalService.open('fundRequestRecordsDecline', {
            organization: $ctrl.organization,
            fundRequest: $ctrl.validatorRequest,
            submit: (err) => {
                if (err) {
                    return showInfoModal(
                        'U kunt op dit moment deze aanvragen niet weigeren.',
                        'Reden: ' + err.data.message
                    );
                }

                $ctrl.reloadRequest();
                PushNotificationsService.success('Gelukt!', 'Aanvraag is geweigerd.');
            }
        });
    };

    $ctrl.requestDisregard = () => {
        ModalService.open('fundRequestDisregard', {
            organization: $ctrl.organization,
            request: $ctrl.validatorRequest,
            submit: (err) => {
                if (err) {
                    return showInfoModal(
                        'U kunt op dit moment deze aanvragen niet weigeren.',
                        'Reden: ' + err.data.message
                    );
                }

                $ctrl.reloadRequest();
                PushNotificationsService.success('Gelukt!', 'Aanvraag is niet behandelen.');
            }
        });
    };

    $ctrl.requestDisregardUndo = () => {
        ModalService.open('fundRequestDisregardUndo', {
            organization: $ctrl.organization,
            request: $ctrl.validatorRequest,
            submit: (err) => {
                if (err) {
                    return showInfoModal(
                        'U kunt op dit moment deze aanvragen niet weigeren.',
                        'Reden: ' + err.data.message
                    );
                }

                $ctrl.reloadRequest();
                PushNotificationsService.success('Gelukt!', 'Aanvraag is niet behandelen.');
            }
        });
    };

    $ctrl.assignRequest = () => {
        FundRequestValidatorService.assign($ctrl.organization.id, $ctrl.validatorRequest.id).then(() => {
            PushNotificationsService.success('Gelukt!', 'U bent nu toegewezen aan deze aanvraag.');
            $ctrl.reloadRequest();
        }, res => {
            PushNotificationsService.danger('Mislukt!', 'U kunt op dit moment geen aanvullingsverzoek doen.');
            console.error(res);
        });
    };

    $ctrl.assignRequestAsSupervisor = () => {
        ModalService.open('fundRequestAssignValidator', {
            fundRequest: $ctrl.validatorRequest,
            organization: $ctrl.organization,
            employees: $ctrl.employees.data.filter((employee) => {
                return employee.id && employee.identity_address != $ctrl.authUser.address;
            }),
            confirm: () => {
                PushNotificationsService.success('Gelukt!', 'Eigenschap toegevoegd.');
                $ctrl.reloadRequest();
            }
        });
    };

    $ctrl.requestResign = () => {
        if (!$ctrl.validatorRequest.can_resign) {
            return $ctrl.requestResignAllEmployeesAsSupervisor($ctrl.validatorRequest);
        }

        FundRequestValidatorService.resign($ctrl.organization.id, $ctrl.validatorRequest.id).then(() => {
            PushNotificationsService.success('Gelukt!', 'U heeft zich afgemeld van deze aanvraag.');
            $ctrl.reloadRequest();
        }, res => {
            PushNotificationsService.danger('Mislukt!', 'U kunt u zelf niet van deze aanvraag afhalen.');
            console.error(res);
        })
    };

    $ctrl.requestResignAllEmployeesAsSupervisor = () => {
        FundRequestValidatorService.requestResignAllEmployeesAsSupervisor($ctrl.organization.id, $ctrl.validatorRequest.id).then(() => {
            PushNotificationsService.success('Gelukt!', 'U heeft zich afgemeld van deze aanvraag.');
            $ctrl.reloadRequest();
        }, res => {
            PushNotificationsService.danger('Mislukt!', 'Error');
            console.error(res);
        })
    };

    $ctrl.appendRecord = () => {
        ModalService.open('fundAppendRequestRecord', {
            fundRequest: $ctrl.validatorRequest,
            organization: $ctrl.organization,
            onAppend: () => {
                PushNotificationsService.success('Gelukt!', 'Eigenschap toegevoegd.');
                $ctrl.reloadRequest();
            }
        });
    };

    $ctrl.downloadFile = (file) => {
        FileService.download(file).then(res => {
            FileService.downloadFile(file.original_name, res.data);
        }, console.error);
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

    $ctrl.$onInit = function() {
        if (!appConfigs.features.organizations.funds.fund_requests) {
            return $state.go('csv-validation');
        }

        $ctrl.isValidatorsSupervisor = $ctrl.organization.permissions.includes('manage_validators');

        $ctrl.employees.data.unshift({
            id: null,
            email: "Selecteer medewerker"
        });

        setRequestFlags();
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
        validatorRequest: '<',
    },
    controller: [
        '$state',
        '$timeout',
        'FileService',
        'ModalService',
        'PushNotificationsService',
        'FundRequestValidatorService',
        'appConfigs',
        FundRequestsShowComponent,
    ],
    templateUrl: 'assets/tpl/pages/fund-requests-show.html',
};
