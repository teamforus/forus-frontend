let SponsorSignUpComponent = function(
    $q,
    $state,
    $rootScope,
    $filter,
    IdentityService,
    FormBuilderService,
    MediaService,
    AuthService,
    SignUpService,
    ModalService
) {
    let $ctrl = this;
    let orgMediaFile = false;
    let authTokenSubscriber = AuthService.accessTokenSubscriber();
    let progressStorage = SignUpService.makeProgressStorage('sponsor-sign_up');
    let $translate = $filter('translate');

    $ctrl.STEP_INFO_GENERAL = 1;
    $ctrl.STEP_CREATE_PROFILE = 2;
    $ctrl.STEP_SELECT_ORGANIZATION = 3;
    $ctrl.STEP_ORGANIZATION_ADD = 4;
    $ctrl.STEP_SIGNUP_FINISHED = 5;

    $ctrl.INFO_STEPS = 1;

    // hide header and add layout classes
    $rootScope.showAppHeader = false;
    $rootScope.layout = [
        'signup-layout',
        'signup-layout-new'
    ];

    $ctrl.step = $ctrl.STEP_INFO_GENERAL;
    $ctrl.signedIn = AuthService.hasCredentials();
    $ctrl.organization = null;
    $ctrl.hasApp = false;
    $ctrl.authEmailSent = false;
    $ctrl.authEmailRestoreSent = false;

    $ctrl.calcSteps = () => {
        $ctrl.STEP_INFO_GENERAL = 1;

        if ($ctrl.signedIn) {
            $ctrl.STEP_CREATE_PROFILE = null;
            $ctrl.STEP_SELECT_ORGANIZATION = 2;
            $ctrl.STEP_ORGANIZATION_ADD = 3;
            $ctrl.STEP_SIGNUP_FINISHED = 4;
            $ctrl.shownSteps = [1, 2, 3];
        } else {
            $ctrl.STEP_CREATE_PROFILE = 2;
            $ctrl.STEP_SELECT_ORGANIZATION = 3;
            $ctrl.STEP_ORGANIZATION_ADD = 4;
            $ctrl.STEP_SIGNUP_FINISHED = 5;
            $ctrl.shownSteps = [1, 2, 3, 4];
        }
    };

    $ctrl.restoreProgress = () => {
        let step = parseInt(progressStorage.get('step'));
        let stepsAvailable = $ctrl.signedIn ? [
            $ctrl.STEP_INFO_GENERAL,
            $ctrl.STEP_SELECT_ORGANIZATION,
            $ctrl.STEP_ORGANIZATION_ADD,
            $ctrl.STEP_SIGNUP_FINISHED,
        ] : [
            $ctrl.STEP_INFO_GENERAL,
            $ctrl.STEP_CREATE_PROFILE,
            $ctrl.STEP_SELECT_ORGANIZATION,
            $ctrl.STEP_ORGANIZATION_ADD,
            $ctrl.STEP_SIGNUP_FINISHED,
        ];

        if (stepsAvailable.indexOf(step) === -1) {
            return $ctrl.setStep($ctrl.STEP_INFO_GENERAL);
        }

        $ctrl.setStep(step);
    };

    $ctrl.setHasAppProp = (hasApp) => {
        if ($ctrl.hasApp = hasApp) {
            $ctrl.requestAuthQrToken();
        } else {
            authTokenSubscriber.stopCheckAccessTokenStatus();
        }

        progressStorage.set('hasApp', $ctrl.hasApp);
    };

    $ctrl.makeSignUpForm = () => {
        let authTarget = 'newSignup';

        return FormBuilderService.build({
            email: '',
            target: authTarget,
            confirm: true
        }, function(form) {
            let resolveErrors = (res) => {
                form.unlock();
                form.errors = res.data.errors;
            };

            return IdentityService.validateEmail(form.values).then(res => {
                if (!res.data.email.used) {
                    IdentityService.make(form.values).then(res => {
                        $ctrl.authEmailSent = true;
                    }, resolveErrors);
                } else {
                    IdentityService.makeAuthEmailToken(
                        form.values.email,
                        authTarget
                    ).then(() => {
                        $ctrl.authEmailRestoreSent = true;
                    }, resolveErrors(res));
                }

            }, resolveErrors);
        });
    }

    $ctrl.makeOrganizationForm = () => {
        return FormBuilderService.build({
            "website": 'https://',
        }, (form) => {
            if (form.values && (form.values.iban != form.values.iban_confirmation)) {
                form.unlock();

                return $q((resolve, reject) => reject({
                    data: {
                        errors: {
                            'iban_confirmation': [$translate('validation.iban_confirmation')]
                        }
                    }
                }));
            }

            let values = JSON.parse(JSON.stringify(form.values));

            if (typeof(values.iban) === 'string') {
                values.iban = values.iban.replace(/\s/g, '');
            }

            return SignUpService.organizationStore(values);
        }, true);
    }

    $ctrl.$onInit = function() {
        $ctrl.signUpForm = $ctrl.makeSignUpForm();
        $ctrl.organizationForm = $ctrl.makeOrganizationForm();

        $ctrl.calcSteps();
        $ctrl.restoreProgress();
    };

    $ctrl.requestAuthQrToken = () => {
        IdentityService.makeAuthToken().then(res => {
            $ctrl.authToken = res.data.auth_token;

            authTokenSubscriber.checkAccessTokenStatus(res.data.access_token, () => {
                $ctrl.calcSteps();
                $ctrl.signedIn = true;
                
                if ($ctrl.step == $ctrl.STEP_CREATE_PROFILE) {
                    $ctrl.setStep($ctrl.STEP_SELECT_ORGANIZATION);
                } else {
                    $ctrl.next();
                }
            });
        }, console.error);
    };

    $ctrl.selectOrganization = (organization) => {
        $ctrl.selectedOrganization = organization;
        $ctrl.setOrganization($ctrl.selectedOrganization);
        $ctrl.setStep($ctrl.STEP_SIGNUP_FINISHED);
    };

    $ctrl.addOrganization = () => {
        $ctrl.setStep($ctrl.STEP_ORGANIZATION_ADD);
    };

    $ctrl.cancelAddOrganization = () => {
        $ctrl.setStep($ctrl.STEP_SELECT_ORGANIZATION);
    };

    $ctrl.loadOrganizations = () => {
        return $q((resolve, reject) => SignUpService.organizations().then(
            res => resolve($ctrl.organizationList = res.data.data), reject
        ));
    };

    $ctrl.setStep = (step) => {
        let stepsTotal = $ctrl.shownSteps.length + $ctrl.INFO_STEPS;

        if (step <= stepsTotal) {
            $ctrl.step = step;
            progressStorage.set('step', step);

            if ($ctrl.step == $ctrl.STEP_SELECT_ORGANIZATION) {
                $ctrl.loadOrganizations().then((organizations) => {
                    if (organizations.length == 0) {
                        $ctrl.setStep($ctrl.STEP_ORGANIZATION_ADD);
                    }
                });
            }

            if ($ctrl.step == $ctrl.STEP_ORGANIZATION_ADD && progressStorage.has('organizationForm')) {
                $ctrl.organizationForm.values = JSON.parse(progressStorage.get('organizationForm'));
            }

            if ($ctrl.step == $ctrl.STEP_CREATE_PROFILE) {
                $ctrl.setHasAppProp(JSON.parse(progressStorage.get('hasApp', 'false')));
            }
        }

        // last step, time for progress cleanup
        if (step >= stepsTotal) {
            progressStorage.clear();
        }
    };

    $ctrl.setOrganization = (organization) => {
        $ctrl.organization = organization;
        progressStorage.set('organizationForm', JSON.stringify(organization));
    };

    $ctrl.next = function() {
        if ($ctrl.step == $ctrl.STEP_ORGANIZATION_ADD) {
            let submit = () => $ctrl.organizationForm.submit().then((res) => {
                $ctrl.setOrganization(res.data.data);
                $ctrl.setStep($ctrl.STEP_SIGNUP_FINISHED);
            }, (res) => {
                $ctrl.organizationForm.errors = res.data.errors;
                $ctrl.organizationForm.unlock();
            });

            if (orgMediaFile) {
                return MediaService.store('organization_logo', orgMediaFile).then((res) => {
                    $ctrl.organizationForm.values.media_uid = res.data.data.uid;
                    orgMediaFile = false;
                    submit();
                });
            }

            submit();
        } else {
            $ctrl.setStep($ctrl.step + 1);
        }
    };

    $ctrl.back = function() {
        if ($ctrl.signedIn && $ctrl.step < $ctrl.STEP_SELECT_ORGANIZATION) {
            return;
        }

        $ctrl.setStep($ctrl.step - 1);
    };

    $ctrl.finish = () => $state.go('organizations-view', {
        id: $ctrl.organization.id
    });

    $ctrl.selectPhoto = (file) => {
        orgMediaFile = file;
    };

    $ctrl.selectOfficePhoto = (file) => {
        officeMediaFile = file;
    };

    $ctrl.openAuthPopup = () => $state.go('home');

    $ctrl.$onDestroy = function() {
        progressStorage.clear();
        authTokenSubscriber.stopCheckAccessTokenStatus();
    };
};

module.exports = {
    bindings: {
        businessTypes: '<',
    },
    controller: [
        '$q',
        '$state',
        '$rootScope',
        '$filter',
        'IdentityService',
        'FormBuilderService',
        'MediaService',
        'AuthService',
        'SignUpService',
        'ModalService',
        SponsorSignUpComponent
    ],
    templateUrl: 'assets/tpl/pages/sponsor-sign-up.html'
};