let FundRequestComponentAuto = function(
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
    $ctrl.bsnIsKnown = false;

    $ctrl.submitInProgress = false;

    // Initialize authorization form
    $ctrl.initAuthForm = () => {
        let target = 'fundRequest-' + $ctrl.fund.id;

        $ctrl.authForm = FormBuilderService.build({
            email: '',
            target: target,
        }, function(form) {
            let resolveErrors = (res) => {
                form.unlock();
                form.errors = res.data.errors;
            };

            IdentityService.validateEmail(form.values).then(res => {
                if (res.data.email.used) {
                    IdentityService.makeAuthEmailToken(form.values.email, target).then(() => {
                        $ctrl.authEmailRestoreSent = true;
                        $ctrl.nextStep();
                    }, resolveErrors);
                } else {
                    IdentityService.make(form.values).then(() => {
                        $ctrl.authEmailSent = true;
                        $ctrl.nextStep();
                    }, resolveErrors);
                }

            }, resolveErrors);
        }, true);
    };

    $ctrl.startDigId = () => {
        DigIdService.startFundRequst($ctrl.fund.id).then(res => {
            document.location = res.data.redirect_url;
        }, res => {
            $state.go('error', {
                errorCode: res.headers('Error-Code')
            });
        });
    };

    $ctrl.submitConfirmCriteria = (criteria) => {
        $ctrl.submitRequest();
    };
    
    $ctrl.submitRequest = () => {
        if ($ctrl.submitInProgress) {
            return; 
        } else {
            $ctrl.submitInProgress = true;
        }

        FundRequestService.store($ctrl.fund.id, {
            records: $ctrl.invalidCriteria.map(criterion => ({
                value: criterion.value,
                record_type_key: criterion.record_type_key,
                fund_criterion_id: criterion.id,
            })),
        }).then((res) => {
            $ctrl.updateState();
            $ctrl.applyFund($ctrl.fund);
        }, (res) => {
            $ctrl.submitInProgress = false;
            $ctrl.step++;
            $ctrl.updateState();
            $ctrl.finishError = true;
            $ctrl.errorReason = res.data.message;
        });
    };

    $ctrl.updateEligibility = () => {
        let invalidCriteria = $ctrl.fund.criteria.filter(criterion => !criterion.is_valid);

        $ctrl.invalidCriteria = JSON.parse(JSON.stringify(invalidCriteria)).map(criteria => {
            criteria.files = [];
            return criteria;
        });

        $ctrl.buildSteps();
    };

    $ctrl.buildSteps = () => {
        // Sign up step + criteria list
        let totalSteps = ($ctrl.signedIn ? 1 : 2) + ((
            $ctrl.authEmailSent || $ctrl.authEmailRestoreSent
        ) ? 1 : 0);

        if (!$ctrl.bsnIsKnown) {
            totalSteps++;
        }

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

        if (!$ctrl.bsnIsKnown && ((step == 2 && !$ctrl.signedIn) || (step == 1 && $ctrl.signedIn))) {
            return 'digid';
        }

        if ($ctrl.signedIn && $ctrl.bsnIsKnown && step == 1) {
            return 'confirm_criteria';
        }
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

    $ctrl.submitConformCriteria = () => {

    };

    $ctrl.prevStep = () => {
        $ctrl.buildSteps();
        $ctrl.step--;
        $ctrl.updateState();
    };

    $ctrl.updateState = () => {
        $ctrl.state = $ctrl.step2state($ctrl.step);
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
                    'Gelukt! Een "%s"-voucher is aan u toegekend.',
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

        if ($ctrl.signedIn) {
            $ctrl.buildTypes().then(() => {
                if ($stateParams.digid_success == 'signed_up' ||
                    $stateParams.digid_success == 'signed_in') {
                    PushNotificationsService.success('DigiD succesvol ingelogd!');

                    if ($ctrl.invalidCriteria.length == 0) {
                        $ctrl.applyFund($ctrl.fund);
                    } else {
                        $ctrl.cleanReload();
                    }
                } else if ($stateParams.digid_error) {
                    return $state.go('error', {
                        errorCode: 'digid_' + $stateParams.digid_error
                    });
                } else {
                    FundRequestService.index($ctrl.fund.id).then((res) => {
                        if (res.data.data.length > 0) {
                            alert('U heeft al een tegoed voor deze regeling.');
                            $state.go('funds');
                        } else if ($ctrl.invalidCriteria.length == 0) {
                            $ctrl.applyFund($ctrl.fund);
                        }
                    });
                }

                IdentityService.identity().then(res => {
                    $ctrl.bsnIsKnown = res.data.bsn;
                    $ctrl.buildSteps();
                    $ctrl.updateState();
                });
            });
        } else {
            $ctrl.buildSteps();
            $ctrl.updateEligibility();
        }

        $ctrl.updateState();
    };
};

module.exports = FundRequestComponentAuto;
