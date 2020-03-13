let SponsorSignUpComponent = function(
    $q,
    $state,
    $stateParams,
    $scope,
    $rootScope,
    $timeout,
    $filter,
    $interval,
    OrganizationService,
    IdentityService,
    CredentialsService,
    FormBuilderService,
    MediaService,
    AuthService,
    ModalService,
    appConfigs
) {
    let $ctrl = this;
    let stopTimeout = null;
 
    const STEP_INFO_GENERAL = 1;
    const STEP_CREATE_PROFILE = 2;
    const STEP_SELECT_ORGANIZATION = 3;
    const STEP_ORGANIZATION_ADD = 4;
    const STEP_SIGNUP_FINISHED = 5;

    const STEPS_ORGANIZATION_SELECT = [
        STEP_CREATE_PROFILE, STEP_SELECT_ORGANIZATION, STEP_SIGNUP_FINISHED
    ];

    const STEPS_ORGANIZATION_ADD = [
        STEP_CREATE_PROFILE, STEP_ORGANIZATION_ADD, STEP_SIGNUP_FINISHED
    ];

    $ctrl.step = STEP_INFO_GENERAL;
    $ctrl.organizationStep = false;
    $ctrl.signedIn = AuthService.hasCredentials();
    $ctrl.organization = null;
    $ctrl.profileCreated = false;
    $ctrl.authEmailSent = false;
    $ctrl.authEmailRestoreSent = false;

    let orgMediaFile = false;
    let timeout;
    let organizationListPromise = () => OrganizationService.list();

    let progressStorage = new(function() {
        this.init = () => {
            if ($ctrl.signedIn) {
                let step = this.getStep();

                if (step) {
                    if (step <= STEP_ORGANIZATION_ADD) {
                        OrganizationService.list().then(res => {
                            if (res.data.data.length) {
                                $ctrl.organizationList = res.data.data;

                                this.setStep(STEP_SELECT_ORGANIZATION);
                                this.shownSteps = STEPS_ORGANIZATION_SELECT;
                            } else {
                                this.setStep(STEP_ORGANIZATION_ADD);
                            }
                        });
                    }
                    this.setStep(step);
                } else {
                    this.setStep(STEP_ORGANIZATION_ADD);
                }
            } else {
                this.setStep(STEP_INFO_GENERAL);
            }
        };

        this.setStep = (step) => {
            localStorage.setItem('sign_up_form.step', step);

            $ctrl.step = step;
        };

        this.getStep = () => {
            let step = parseInt(localStorage.getItem('sign_up_form.step'));

            if (step >= STEP_SELECT_ORGANIZATION) {
                let organisation_data = {};

                if (localStorage.getItem('sign_up_form.organizationForm') != null) {
                    organisation_data = JSON.parse(
                        localStorage.getItem('sign_up_form.organizationForm')
                    );
                }

                if (step == STEP_SELECT_ORGANIZATION) {
                    $ctrl.shownSteps = STEPS_ORGANIZATION_SELECT;

                    loadOrganizations();
                } else if (step == STEP_ORGANIZATION_ADD) {
                    $ctrl.organizationForm.values = organisation_data;
                } else {
                    $ctrl.organization = organisation_data;
                }
            }

            return isNaN(step) ? null : step;
        };

        this.clear = () => {
            localStorage.removeItem('sign_up_form.step');
            localStorage.removeItem('sign_up_form.signUpForm');
            localStorage.removeItem('sign_up_form.organizationForm');
        };
    })();

    $ctrl.afterInit = () => {};

    $ctrl.chageBusinessType = (value) => {
        $ctrl.organizationForm.values.business_type_id = value.id;
    };

    $ctrl.$onInit = function() {
        let target = 'newSignup';

        $ctrl.signUpForm = FormBuilderService.build({
            email: '',
            pin_code: "1111",
            target: target,
        }, function(form) {
            let resolveErrors = (res) => {
                form.unlock();
                form.errors = res.data.errors;
            };
            
            return IdentityService.validateEmail({
                email: form.values.records.primary_email,
            }).then(res => {
                if (res.data.email.unique) {
                    IdentityService.make(form.values).then(res => {
                        $ctrl.authEmailSent = true;

                        CredentialsService.set(res.data.access_token);
                        $ctrl.signedIn = true;
                        $ctrl.setStep(STEP_ORGANIZATION_ADD);
                    }, resolveErrors);
                } else {
                    IdentityService.makeAuthEmailToken(
                        appConfigs.client_key + '_' + appConfigs.panel_type,
                        form.values.records.primary_email,
                        target
                    ).then(res => {
                        $ctrl.authEmailRestoreSent = true;
                    }, resolveErrors(res));
                }

            }, resolveErrors);
        });

        $ctrl.organizationForm = FormBuilderService.build({
            "website": 'https://',
        }, (form) => {
            if (form.values) {
                if (form.values.iban != form.values.iban_confirmation) {
                    return $q((resolve, reject) => {
                        reject({
                            data: {
                                errors: {
                                    'iban_confirmation': [$filter('translate')('validation.iban_confirmation')]
                                }
                            }
                        });
                    });
                }
            }

            form.lock();

            let values = JSON.parse(JSON.stringify(form.values));

            if (typeof(values.iban) === 'string') {
                values.iban = values.iban.replace(/\s/g, '');
            }

            return OrganizationService.store(values);
        });

        $ctrl.businessType = $ctrl.businessTypes.filter(
            option => option.id == $ctrl.organizationForm.values.business_type_id
        )[0] || null;

        progressStorage.init();

        $scope.$on('$destroy', progressStorage.destroy);

        $ctrl.afterInit();
    };

    $ctrl.createAppProfile = () => {
        $ctrl.signUpForm.submit();
    }

    $ctrl.selectOrganization = (organization) => {
        $ctrl.selectedOrganization = organization;
        $ctrl.setOrganization($ctrl.selectedOrganization);

        $ctrl.setStep(STEP_SIGNUP_FINISHED);
    };

    $ctrl.addOrganization = () => {
        $ctrl.setStep(STEP_ORGANIZATION_ADD);
    };

    let loadOrganizations = () => {
        organizationListPromise().then(res => {
            if (res.data.data.length) {
                $ctrl.organizationList = res.data.data;
            }
        });
    };

    $ctrl.setStep = (step) => {
        if (step <= $ctrl.totalSteps.length) {
            progressStorage.setStep(step);
        } else {
            progressStorage.clear();
        }
    };

    $ctrl.setOrganization = (organization) => {
        $ctrl.organization = organization;
        localStorage.setItem('sign_up_form.organizationForm', JSON.stringify(
            organization
        ));
    };

    $ctrl.next = async function() {
        if ($ctrl.step == STEP_CREATE_PROFILE) {
            if ($ctrl.organizationList.length) {
                $ctrl.setStep(STEP_SELECT_ORGANIZATION);
            } else {
                $ctrl.setStep(STEP_ORGANIZATION_ADD);
            }
        } else if ($ctrl.step < STEP_SELECT_ORGANIZATION) {
            $ctrl.setStep($ctrl.step + 1);
        } else if ($ctrl.step == STEP_ORGANIZATION_ADD) {
            let authRes;

            if (!$ctrl.signedIn) {
                authRes = await $ctrl.signUpForm.submit().catch((res) => {
                    $ctrl.signUpForm.unlock();
                    $ctrl.signUpForm.errors = res.data.errors;
                    $ctrl.organizationStep = true;

                    $ctrl.setStep(STEP_ORGANIZATION_ADD);
                });

                if (typeof(authRes) !== 'undefined') {
                    CredentialsService.set(authRes.data.access_token);
                    $ctrl.signedIn = true;
                } else {
                    return;
                }
            }

            if (orgMediaFile) {
                $ctrl.organizationForm.values.media_uid = (
                    await MediaService.store('organization_logo', orgMediaFile)
                ).data.data.uid;

                orgMediaFile = false;
            }

            $ctrl.organizationForm.submit().then((res) => {
                $rootScope.$broadcast('auth:update');

                $ctrl.setOrganization(res.data.data);
                $ctrl.setStep(STEP_SIGNUP_FINISHED);
            }, (res) => {
                $ctrl.organizationForm.errors = res.data.errors;
                $ctrl.organizationForm.unlock();
            });

        } else {
            $ctrl.setStep($ctrl.step + 1);
        }
    };

    $ctrl.back = function() {
        if ($ctrl.signedIn && $ctrl.step < STEP_SELECT_ORGANIZATION) {
            return;
        }

        if ($ctrl.step == STEP_ORGANIZATION_ADD) {
            $ctrl.setStep($ctrl.step - 2);
        } else {
            $ctrl.setStep($ctrl.step - 1);
        }
    };

    $ctrl.finish = () => {
        $state.go('organizations');
    }

    $ctrl.selectPhoto = (file) => {
        orgMediaFile = file;
    };

    $ctrl.selectOfficePhoto = (file) => {
        officeMediaFile = file;
    };

    $scope.authorizePincodeForm = FormBuilderService.build({
        auth_code: "",
    }, function(form) {
        form.lock();

        return IdentityService.authorizeAuthCode(
            form.values.auth_code
        );
    });

    $ctrl.$onDestroy = function() {
        $timeout.cancel(timeout);
    };

    $ctrl.totalSteps = Array.from({length: 5}, (v, k) => k + 1);
    $ctrl.shownSteps = STEPS_ORGANIZATION_ADD;

    $ctrl.goToMain = () => {
        $state.go('home');
    }
};

module.exports = {
    bindings: {
        businessTypes: '<',
    },
    controller: [
        '$q',
        '$state',
        '$stateParams',
        '$scope',
        '$rootScope',
        '$timeout',
        '$filter',
        '$interval',
        'OrganizationService',
        'IdentityService',
        'CredentialsService',
        'FormBuilderService',
        'MediaService',
        'AuthService',
        'ModalService',
        'appConfigs',
        SponsorSignUpComponent
    ],
    templateUrl: 'assets/tpl/pages/sponsor-sign-up.html'
};