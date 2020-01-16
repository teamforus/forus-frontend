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
                        $ctrl.authEmailSent = true;
                        $ctrl.nextStep();
                    }, resolveErrors);
                } else {
                    IdentityService.makeAuthEmailToken(
                        appConfigs.client_key + '_webshop',
                        form.values.records.primary_email,
                        target
                    ).then(() => {
                        $ctrl.authEmailRestoreSent = true;
                        $ctrl.nextStep();
                    }, resolveErrors);
                }

            }, resolveErrors);
        }, true);
    };

    $ctrl.startDigId = () => {
        DigIdService.startFundRequst($ctrl.fund.id).then(res => {
            document.location = res.data.redirect_url;
        }, console.error);
    };

    $ctrl.submitConfirmCriteria = (criteria) => {
        $ctrl.submitRequest();
    };
    
    $ctrl.submitRequest = () => {
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
            $ctrl.step++;
            $ctrl.updateState();
            $ctrl.finishError = true;
            $ctrl.errorReason = res.data.message;
        });
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

        $ctrl.invalidCriteria = JSON.parse(JSON.stringify(
            invalidCriteria
        )).map(criteria => {
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
                } else if ($stateParams.digid_error == 'unknown_error') {
                    PushNotificationsService.danger(
                        "Er is een fout opgetreden in de communicatie met DigiD. Probeert u het later nogmaals.",
                        "Indien deze fout blijft aanhouden, kijk dan op de website https://www.digid.nl/ voor de laatste informatie.",
                    );
                    $ctrl.cleanReload();
                } else if ($stateParams.digid_error == 'uid_used') {
                    PushNotificationsService.danger(
                        "BSN-nummer al gebruikt",
                        "Het BSN-nummer is al ingebruik op een ander account. Herstel uw account op het inlog venster om verder te gaan."
                    );
                    $ctrl.cleanReload();
                } else if ($stateParams.digid_error == 'uid_dont_match') {
                    PushNotificationsService.danger(
                        "Er is al een BSN-nummer bekend bij dit profiel",
                        "Het BSN nummer dat u opgehaald heeft met DigiD verschilt met het BSN-nummer gekoppelt staat aan dit profiel. Start een nieuwe aanvraag."
                    );
                    $ctrl.cleanReload();
                } else if ($stateParams.digid_error == 'error_0040') {
                    PushNotificationsService.danger(
                        "Inlogpoging geannuleerd.",
                        "U hebt deze inlogpoging geannuleerd. Probeer eventueel opnieuw om verder te gaan."
                    );
                    $ctrl.cleanReload();
                } else if ($stateParams.digid_error && $stateParams.digid_error.indexOf('error_') === 0) {
                    PushNotificationsService.danger(
                        "Er is een fout opgetreden in de communicatie met DigiD. Probeert u het later nogmaals.",
                        "Indien deze fout blijft aanhouden, kijk dan op de website https://www.digid.nl/ voor de laatste informatie."
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
