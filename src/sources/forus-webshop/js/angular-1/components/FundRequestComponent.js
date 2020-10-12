let sprintf = require('sprintf-js').sprintf;

let FundRequestComponent = function(
    $q,
    $sce,
    $state,
    $stateParams,
    $timeout,
    $filter,
    RecordService,
    FundService,
    AuthService,
    FundRequestService,
    PushNotificationsService,
    ModalService,
    FileService,
    appConfigs
) {
    let $ctrl = this;
    let $trans = $filter('translate');
    let welcomeSteps = 2;

    $ctrl.step = 1;
    $ctrl.state = 'welcome';
    $ctrl.totalSteps = [];
    $ctrl.recordsByKey = {};
    $ctrl.invalidCriteria = [];
    $ctrl.authToken = false;
    $ctrl.signedIn = false;
    $ctrl.authEmailSent = false;
    $ctrl.authEmailRestoreSent = false;
    $ctrl.recordsSubmitting = false;
    $ctrl.files = [];
    $ctrl.errorReason = false;
    $ctrl.finishError = false;
    $ctrl.bsnIsKnown = true;
    $ctrl.appConfigs = appConfigs;
    $ctrl.hasApp = false;

    $ctrl.shownSteps = [];

    $ctrl.criterionValuePrefix = {
        net_worth: '€',
        base_salary: '€'
    };

    $ctrl.digidAvailable = $ctrl.appConfigs.features.digid;
    $ctrl.digidMandatory = $ctrl.appConfigs.features.digid_mandatory;

    let trans_record_checkbox = (criteria_record_key, criteria_value) => {
        let trans_key = 'fund_request.sign_up.record_checkbox.' + criteria_record_key;
        let trans_fallback_key = 'fund_request.sign_up.record_checkbox.default';
        let translated = $trans(trans_key, {
            value: criteria_value
        });

        return translated === trans_key ? $trans(trans_fallback_key, {
            value: criteria_value
        }) : translated;
    };

    // Submit criteria record
    $ctrl.submitStepCriteria = (criteria) => {
        return $ctrl.validateCriteria(criteria).then($ctrl.nextStep, () => { });
    };

    // Submit or Validate record criteria
    $ctrl.validateCriteria = (criteria) => {
        return $q((resolve, reject) => {
            $ctrl.recordsSubmitting = true;

            FundRequestService.storeValidate($ctrl.fund.id, {
                records: [{
                    fund_criterion_id: criteria.id,
                    record_type_key: criteria.record_type_key,
                    value: criteria.input_value
                }]
            }).then(_res => {
                let record = _res.data;

                FileService.storeValidateAll(
                    criteria.files,
                    'fund_request_record_proof'
                ).then(res => {
                    $ctrl.recordsSubmitting = false;
                    criteria.errors = {};
                    resolve(record);
                }, res => {
                    $ctrl.recordsSubmitting = false;
                    reject(criteria.errors = res.data.errors);
                });
            }, res => {
                $ctrl.recordsSubmitting = false;
                reject(criteria.errors = {
                    value: res.data.errors['records.0.value'],
                    record_type_key: res.data.errors['records.0.record_type_key'],
                    fund_criterion_id: res.data.errors['records.0.fund_criterion_id'],
                });
            });
        });
    };

    // Submit or Validate record criteria
    $ctrl.uploadCriteriaFiles = (criteria) => {
        return $q((resolve, reject) => {
            $ctrl.recordsSubmitting = true;

            FileService.storeAll(
                criteria.files || [],
                'fund_request_record_proof'
            ).then(res => {
                criteria.filesUploaded = res.map(file => file.data.data);
                resolve(criteria);
            }, res => {
                reject(criteria.errors = res.data.errors);
            });
        });
    };

    $ctrl.submitRequest = () => {
        if ($ctrl.submitInProgress) {
            return;
        } else {
            $ctrl.submitInProgress = true;
        }
        let records = appConfigs.features.auto_validation ? $ctrl.invalidCriteria.map(criterion => ({
            value: criterion.value,
            record_type_key: criterion.record_type_key,
            fund_criterion_id: criterion.id,
        })) : criteria.map(criterion => ({
            value: criterion.input_value,
            record_type_key: criterion.record_type_key,
            fund_criterion_id: criterion.id,
            files: criterion.filesUploaded.map(file => file.uid),
        }));

        $q.all($ctrl.invalidCriteria.map($ctrl.uploadCriteriaFiles)).then(criteria => {
            FundRequestService.store($ctrl.fund.id, {
                records: records
            }).then(() => {
                if (appConfigs.features.auto_validation) {
                    $ctrl.applyFund($ctrl.fund);
                } else {
                    $ctrl.step++;
                    $ctrl.updateState();
                }
            }, (res) => {
                $ctrl.step++;
                $ctrl.updateState();
                $ctrl.finishError = true;
                $ctrl.errorReason = res.data.message;
                $ctrl.submitInProgress = false;
            });
        });
    };

    $ctrl.setRecordValue = (invalidCriteria) => {
        $timeout(() => {
            invalidCriteria.input_value = invalidCriteria.is_checked ? invalidCriteria.value : null;
        }, 250)
    };

    $ctrl.updateEligibility = () => {
        let validCriteria = $ctrl.fund.criteria.filter(criterion => criterion.is_valid);
        let invalidCriteria = $ctrl.fund.criteria.filter(criterion => !criterion.is_valid);

        validCriteria.forEach((criterion) => {
            criterion.isValid = true;
        });

        invalidCriteria.forEach((criterion) => {
            criterion.isValid = false;
        });

        $ctrl.invalidCriteria = JSON.parse(JSON.stringify(
            invalidCriteria
        )).map(criterion => {
            criterion.files = [];
            criterion.description_html = $sce.trustAsHtml(
                criterion.description_html
            );
            return criterion;
        });

        $ctrl.invalidCriteria = $ctrl.invalidCriteria.map(criterion => {
            let control_type = criterion.operator == '=' ? 'ui_control_checkbox' : {
                // checkboxes
                'children': 'ui_control_checkbox',
                'kindpakket_eligible': 'ui_control_checkbox',
                'kindpakket_2018_eligible': 'ui_control_checkbox',
                // dates
                'birth_date': 'ui_control_date',
                // stepper
                'children_nth': 'ui_control_step',
                // numbers
                'tax_id': 'ui_control_number',
                'bsn': 'ui_control_number',
                // currency
                'net_worth': 'ui_control_currency',
                'base_salary': 'ui_control_currency',
            }[criterion.record_type_key] || 'ui_control_text';

            return Object.assign(criterion, {
                control_type: control_type,
                label: trans_record_checkbox(criterion.record_type_key, criterion.value),
                input_value: {
                    ui_control_checkbox: null,
                    ui_control_date: moment().format('DD-MM-YYYY'),
                    ui_control_step: 0,
                    ui_control_number: undefined,
                    ui_control_currency: undefined,
                }[control_type]
            });
        });

        $ctrl.buildSteps();
    };

    $ctrl.buildSteps = () => {
        $ctrl.totalSteps = [];

        for (let index = 0; index < ((welcomeSteps - 1) + (
            appConfigs.features.auto_validation ? 1 : $ctrl.invalidCriteria.length
        )); index++) {
            $ctrl.totalSteps.push(index + 1);
        }
    };

    $ctrl.step2state = (step) => {
        if (step == 1) {
            return 'welcome';
        }

        if (step == 2) {
            return appConfigs.features.auto_validation ? 'confirm_criteria' : 'criteria';
        }

        if (appConfigs.features.auto_validation && step == 3) {
            return 'done';
        }

        if (step == $ctrl.totalSteps.length + welcomeSteps) {
            return 'done';
        }

        return 'criteria_' + ((step - welcomeSteps) - 1);
    };

    $ctrl.buildTypes = () => {
        return $q((resolve, reject) => {
            RecordService.list().then(res => {
                $ctrl.records = res.data;
                $ctrl.records.forEach(function(record) {
                    if (!$ctrl.recordsByKey[record.key]) {
                        $ctrl.recordsByKey[record.key] = [];
                    }

                    $ctrl.recordsByKey[record.key].push(record);
                });

                $ctrl.buildSteps();
                $ctrl.updateEligibility();
                resolve($ctrl.invalidCriteria);
            }, reject);
        });
    };

    $ctrl.nextStep = () => {
        $ctrl.buildSteps();

        if ($ctrl.step == ((welcomeSteps - 1) + $ctrl.totalSteps.length)) {
            return $ctrl.submitRequest();
        }

        $ctrl.step++;
        $ctrl.updateState();
    };

    $ctrl.prevStep = () => {
        $ctrl.buildSteps();
        $ctrl.step--;
        $ctrl.updateState();
    };

    $ctrl.updateState = () => {
        $ctrl.state = $ctrl.step2state($ctrl.step);
    };

    $ctrl.prepareRecordTypes = () => {
        let recordTypes = {};

        $ctrl.recordTypes.forEach((recordType) => {
            recordTypes[recordType.key] = recordType;
        });

        $ctrl.recordTypes = recordTypes;
    };

    $ctrl.applyFund = function(fund) {
        return $q((resolve, reject) => {
            FundService.apply(fund.id).then(function(res) {
                PushNotificationsService.success(sprintf(
                    'Succes! %s tegoed geactiveerd!',
                    $ctrl.fund.name
                ));
                $state.go('voucher', res.data.data);
                resolve(res.data);
            }, res => {
                reject(res);
                PushNotificationsService.danger(res.data.message);
            })
        });
    };

    $ctrl.getFundVouchers = (fund, vouchers) => {
        return vouchers.filter(voucher => voucher.fund_id === fund.id);
    };

    $ctrl.getFirstFundVoucher = (fund, vouchers) => {
        let fundVouchers = $ctrl.getFundVouchers(fund, vouchers);

        if (fundVouchers.length > 0) {
            return fundVouchers[0];
        }

        return false;
    }

    $ctrl.finish = () => $state.go('funds');
    $ctrl.goToMain = () => $state.go('home');

    $ctrl.goToActivationComponent = () => {
        return $state.go('fund-activate', {
            fund_id: $ctrl.fund.id
        });
    };

    $ctrl.submitConfirmCriteria = () => {
        $ctrl.submitRequest();
    };

    $ctrl.$onInit = function() {
        let pendingRequests = $ctrl.fundRequests.data.filter(request => request.state === 'pending');

        $ctrl.signedIn = AuthService.hasCredentials();
        $ctrl.bsnIsKnown = $ctrl.identity && $ctrl.identity.bsn;
        $ctrl.digidAvailable = $ctrl.appConfigs.features.digid;
        $ctrl.digidMandatory = $ctrl.appConfigs.features.digid_mandatory;


        // The user is not authenticated and have to go back to sign-up page
        if (!$ctrl.signedIn || !$ctrl.identity || (appConfigs.features.auto_validation && !$ctrl.bsnIsKnown)) {
            return $state.go('start');
        }

        // The fund is already taken by identity partner
        if ($ctrl.fund.taken_by_partner || (pendingRequests[0] || false)) {
            return $ctrl.goToActivationComponent();
        }

        // All the criteria are meet, request the voucher
        if ($ctrl.fund.criteria.filter(criterion => !criterion.is_valid).length == 0) {
            return $ctrl.goToActivationComponent();
        }

        $ctrl.prepareRecordTypes();

        $ctrl.buildTypes().then(() => {
            if ($ctrl.fund.taken_by_partner) {
                $ctrl.step = 100;
                $ctrl.updateState();

                return ModalService.open('modalNotification', {
                    type: 'info',
                    title: 'Dit tegoed is al geactiveerd',
                    closeBtnText: 'Bevestig',
                    description: [
                        "U krijgt deze melding omdat het tegoed is geactiveerd door een ",
                        "famielid of voogd. De tegoeden zijn beschikbaar in het account ",
                        "van de persoon die deze als eerste heeft geactiveerd."
                    ].join(''),
                }, {
                    onClose: () => {
                        $state.go('home');
                    }
                });
            }

            if ($stateParams.digid_success == 'signed_up' || $stateParams.digid_success == 'signed_in') {
                PushNotificationsService.success('Succes! Ingelogd met DigiD.');

                if ($ctrl.invalidCriteria.length == 0) {
                    return $ctrl.applyFund($ctrl.fund);
                }
            } else if ($stateParams.digid_error) {
                return $state.go('error', {
                    errorCode: 'digid_' + $stateParams.digid_error
                });
            }

            FundRequestService.index($ctrl.fund.id).then((res) => {
                let pendingRequests = res.data.data.filter(request => request.state === 'pending');
                let pendingRequest = pendingRequests[0] || false;

                if (pendingRequest) {
                    $ctrl.fund.criteria.map(criteria => {
                        let record = pendingRequest.records.filter(record => {
                            return record.record_type_key == criteria.record_type_key;
                        })[0];

                        if (record) {
                            criteria.request_state = record.state;
                        }

                        return criteria;
                    });

                    $ctrl.state = 'fund_already_applied';
                } else if ($ctrl.invalidCriteria.length == 0) {
                    $ctrl.applyFund($ctrl.fund);
                }
            });

            if (($ctrl.bsnIsKnown = $ctrl.identity.bsn) || !$ctrl.digidAvailable) {
                $ctrl.step = 1;
                $ctrl.updateState();
            }
        });

        $ctrl.updateState();
    };
};

module.exports = {
    bindings: {
        fund: '<',
        records: '<',
        identity: '<',
        vouchers: '<',
        recordTypes: '<',
        fundRequests: '<',
    },
    controller: [
        '$q',
        '$sce',
        '$state',
        '$stateParams',
        '$timeout',
        '$filter',
        'RecordService',
        'FundService',
        'AuthService',
        'FundRequestService',
        'PushNotificationsService',
        'ModalService',
        'FileService',
        'appConfigs',
        FundRequestComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-request.html',
};
