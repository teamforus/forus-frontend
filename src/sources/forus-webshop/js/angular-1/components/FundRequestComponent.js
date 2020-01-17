let sprintf = require('sprintf-js').sprintf;

let FundRequestComponent = function(
    $q,
    $state,
    $stateParams,
    $timeout,
    RecordService,
    FundService,
    AuthService,
    IdentityService,
    FundRequestService,
    FormBuilderService,
    CredentialsService,
    PushNotificationsService,
    DigIdService,
    FileService,
    appConfigs
) {
    try {
        if (appConfigs.features.funds.fund_requests === false) {
            $state.go('home');
        }
    } catch (error) {}

    !appConfigs.features.auto_validation ? FundRequestComponentDefault(
        this,
        $q,
        $state,
        $stateParams,
        $timeout,
        RecordService,
        FundService,
        AuthService,
        IdentityService,
        FundRequestService,
        FormBuilderService,
        CredentialsService,
        PushNotificationsService,
        DigIdService,
        FileService,
        appConfigs
    ) : FundRequestComponentAuto(
        this,
        $q,
        $state,
        $stateParams,
        $timeout,
        RecordService,
        FundService,
        AuthService,
        IdentityService,
        FundRequestService,
        FormBuilderService,
        CredentialsService,
        PushNotificationsService,
        DigIdService,
        FileService,
        appConfigs
    );
};

let FundRequestComponentDefault = function(
    $ctrl,
    $q,
    $state,
    $stateParams,
    $timeout,
    RecordService,
    FundService,
    AuthService,
    IdentityService,
    FundRequestService,
    FormBuilderService,
    CredentialsService,
    PushNotificationsService,
    DigIdService,
    FileService,
    appConfigs
) {
    $ctrl.step = 1;
    $ctrl.state = '';
    $ctrl.totalSteps = 1;
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

    let timeout = null;
    let stopTimeout = null;

    $ctrl.criterionValuePrefix = {
        net_worth: '€',
        base_salary: '€'
    };

    $ctrl.startDigId = () => {
        DigIdService.startFundRequst($ctrl.fund.id).then(res => {
            document.location = res.data.redirect_url;
        }, console.error);
    };

    // Initialize authorization form
    $ctrl.initAuthForm = () => {
        let target = 'fundRequest-' + $ctrl.fund.id;

        $ctrl.authForm = FormBuilderService.build({
            email: '',
            pin_code: 1111,
            target: target,
        }, function(form) {
            let resolveErrors = () => {
                form.unlock();
                form.errors = res.data.errors;
            };

            IdentityService.validateEmail({
                email: form.values.records.primary_email,
            }).then(res => {
                if (res.data.email.unique) {
                    IdentityService.make(form.values).then(() => {
                        stopTimeout = true;
                        $ctrl.authEmailSent = true;
                        $ctrl.nextStep();
                    }, resolveErrors);
                } else {
                    IdentityService.makeAuthEmailToken(
                        appConfigs.client_key + '_webshop',
                        form.values.records.primary_email,
                        target
                    ).then(() => {
                        stopTimeout = true;
                        $ctrl.authEmailRestoreSent = true;
                        $ctrl.nextStep();
                    }, resolveErrors);
                }

            }, resolveErrors);
        }, true);
    };

    // Submit criteria record
    $ctrl.submitStepCriteria = (criteria) => {
        return $ctrl.validateCriteria(criteria).then($ctrl.nextStep, () => {});
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
        $q.all(
            $ctrl.invalidCriteria.map($ctrl.uploadCriteriaFiles)
        ).then(criteria => {
            FundRequestService.store($ctrl.fund.id, {
                records: criteria.map(criterion => ({
                    value: criterion.input_value,
                    record_type_key: criterion.record_type_key,
                    fund_criterion_id: criterion.id,
                    files: criterion.filesUploaded.map(file => file.uid),
                })),
            }).then((res) => {
                $ctrl.step++;
                $ctrl.updateState();
            }, (res) => {
                $ctrl.step++;
                $ctrl.updateState();
                $ctrl.finishError = true;
                $ctrl.errorReason = res.data.message;
            });
        });
    };

    $ctrl.applyAccessToken = function(access_token) {
        stopTimeout = true;
        CredentialsService.set(access_token);
        $ctrl.buildTypes();
        $ctrl.nextStep();
        document.location.reload();
    };

    $ctrl.checkAccessTokenStatus = (type, access_token) => {
        if (stopTimeout) {
            return stopTimeout = null;
        }

        IdentityService.checkAccessToken(access_token).then((res) => {
            if (res.data.message == 'active') {
                $ctrl.applyAccessToken(access_token);
            } else if (res.data.message == 'pending') {
                timeout = $timeout(function() {
                    $ctrl.checkAccessTokenStatus(type, access_token);
                }, 2500);
            } else {
                document.location.reload();
            }
        });
    };

    $ctrl.requestAuthQrToken = () => {
        IdentityService.makeAuthToken().then((res) => {
            $ctrl.authToken = res.data.auth_token;
            $ctrl.checkAccessTokenStatus('token', res.data.access_token);
        }, console.log);
    };

    $ctrl.updateEligibility = () => {
        let validators = $ctrl.fund.validators.map(function(validator) {
            return validator.identity_address;
        });

        let validCriteria = $ctrl.fund.criteria.filter(criterion => {
            return FundService.checkEligibility(
                $ctrl.recordsByKey[criterion.record_type_key] || [],
                criterion,
                validators,
                $ctrl.fund.organization_id
            );
        });;

        let invalidCriteria = $ctrl.fund.criteria.filter(criteria => {
            return validCriteria.indexOf(criteria) === -1;
        });

        validCriteria.forEach((criterion) => {
            criterion.isValid = true;
        });

        invalidCriteria.forEach((criterion) => {
            criterion.isValid = false;
        });

        $ctrl.invalidCriteria = JSON.parse(JSON.stringify(
            invalidCriteria
        )).map(criteria => {
            criteria.files = [];
            return criteria;
        });

        $ctrl.invalidCriteria = $ctrl.invalidCriteria.map(criterion => {
            let control_type = {
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
            } [criterion.record_type_key] || 'ui_control_text';

            return Object.assign(criterion, {
                control_type: control_type,
                input_value: {
                    ui_control_checkbox: false,
                    ui_control_date: moment().format('DD-MM-YYYY'),
                    ui_control_step: 0,
                    ui_control_number: undefined,
                    ui_control_currency: undefined,
                } [control_type]
            });
        });

        $ctrl.buildSteps();
    };

    $ctrl.buildSteps = () => {
        // Sign up step + criteria list
        let totalSteps = ($ctrl.signedIn ? 1 : 2) + ((
            $ctrl.authEmailSent || $ctrl.authEmailRestoreSent
        ) ? 1 : 0);

        // Other criteria
        totalSteps += $ctrl.invalidCriteria.length;

        $ctrl.totalSteps = [];

        for (let index = 0; index < totalSteps; index++) {
            $ctrl.totalSteps.push(index + 1);
        }
    };

    $ctrl.step2state = (step) => {
        if (step == 1 && !$ctrl.signedIn) {
            return 'auth';
        }

        if (step == 2 && !$ctrl.signedIn && (
                $ctrl.authEmailSent || $ctrl.authEmailRestoreSent
            )) {
            return 'auth_email_sent';
        }

        if ((step == 2 && !$ctrl.signedIn) || (step == 1 && $ctrl.signedIn)) {
            return 'criteria';
        }

        if (step == $ctrl.totalSteps.length + 1) {
            return 'done';
        }

        let prevSteps = 1 + ($ctrl.signedIn ? 0 : 1);

        return 'criteria_' + ((step - prevSteps) - 1);
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

        if ($ctrl.step == $ctrl.totalSteps.length) {
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

        if ($ctrl.state == 'auth') {
            $ctrl.requestAuthQrToken();
        }
    };

    $ctrl.prepareRecordTypes = () => {
        let recordTypes = {};

        $ctrl.recordTypes.forEach((recordType) => {
            recordTypes[recordType.key] = recordType;
        });

        $ctrl.recordTypes = recordTypes;
    };

    $ctrl.finish = () => {
        $state.go('home');
    };

    $ctrl.cleanReload = () => {
        $state.go($state.current.name, {
            fund_id: $ctrl.fund.id,
            digid_success: null,
            digid_error: null,
        });
    };

    $ctrl.applyFund = function(fund) {
        return $q((resolve, reject) => {
            FundService.apply(fund.id).then(function(res) {
                PushNotificationsService.success(sprintf(
                    'Fund "%s" voucher received.',
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

    $ctrl.$onInit = function() {
        $ctrl.signedIn = AuthService.hasCredentials();
        $ctrl.initAuthForm();
        $ctrl.prepareRecordTypes();

        if ($ctrl.signedIn) {
            $ctrl.buildTypes().then(() => {
                if ($stateParams.digid_success == 'signed_up' ||
                    $stateParams.digid_success == 'signed_in') {
                    PushNotificationsService.success('DigId synchronization success.');

                    if ($ctrl.invalidCriteria.length == 0) {
                        $ctrl.applyFund($ctrl.fund);
                    } else {
                        $ctrl.cleanReload();
                    }
                } else if ($stateParams.digid_error == 'unknown_error') {
                    PushNotificationsService.danger(
                        "Error error",
                    );
                    $ctrl.cleanReload();
                } else if ($stateParams.digid_error == 'uid_used') {
                    PushNotificationsService.danger(
                        "BSN number used",
                        "The BSN number returned by DigID was already claimend by another identity."
                    );
                    $ctrl.cleanReload();
                } else if ($stateParams.digid_error == 'uid_dont_match') {
                    PushNotificationsService.danger(
                        "BSN differ",
                        "The BSN number returned by DigID doesn't match BSN number registered by your identity."
                    );
                    $ctrl.cleanReload();
                } else if ($stateParams.digid_error == 'error_0040') {
                    PushNotificationsService.danger(
                        "Canceled",
                        "You canceled DigID authentication."
                    );
                    $ctrl.cleanReload();
                } else if ($stateParams.digid_error && $stateParams.digid_error.indexOf('error_') === 0) {
                    PushNotificationsService.danger(
                        "Failed",
                        "Error code " + $stateParams.digid_error + " encountered."
                    );
                    $ctrl.cleanReload();
                } else {
                    FundRequestService.index($ctrl.fund.id).then((res) => {
                        if (res.data.data.length > 0) {
                            alert('You already requested this fund');
                            $state.go('funds');
                        } else if ($ctrl.invalidCriteria.length == 0) {
                            $ctrl.applyFund($ctrl.fund);
                        }
                    });
                }

                IdentityService.identity().then(res => {
                    $ctrl.bsnIsKnown = res.data.bsn;
                });
            });
        } else {
            $ctrl.buildSteps();
            $ctrl.updateEligibility();
        }

        $ctrl.updateState();
    };
};

let FundRequestComponentAuto = require('./FundRequestAutoComponent');

module.exports = {
    bindings: {
        records: '<',
        recordTypes: '<',
        fund: '<',
    },
    controller: [
        '$q',
        '$state',
        '$stateParams',
        '$timeout',
        'RecordService',
        'FundService',
        'AuthService',
        'IdentityService',
        'FundRequestService',
        'FormBuilderService',
        'CredentialsService',
        'PushNotificationsService',
        'DigIdService',
        'FileService',
        'appConfigs',
        FundRequestComponent
    ],
    templateUrl: (appConfigs) => {
        return 'assets/tpl/pages/fund-request' + (
            appConfigs.features.auto_validation ? '-auto' : ''
        ) + '.html';
    }
};