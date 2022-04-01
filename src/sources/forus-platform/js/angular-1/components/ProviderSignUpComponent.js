const ProviderSignUpComponent = function(
    $q,
    $state,
    $stateParams,
    $scope,
    $rootScope,
    $filter,
    $interval,
    OfficeService,
    IdentityService,
    FormBuilderService,
    OrganizationEmployeesService,
    MediaService,
    ShareService,
    DemoTransactionService,
    ProviderFundService,
    AuthService,
    ModalService,
    SignUpService
) {
    let $ctrl = this;
    let orgMediaFile = false;
    let authTokenSubscriber = AuthService.accessTokenSubscriber();
    let progressStorage = SignUpService.makeProgressStorage('provider-sign_up');
    let $translate = $filter('translate');

    let waitingSms = false;
    let isMobile = () => $(window).width() < 1000;

    $rootScope.showAppHeader = false;
    $rootScope.layout = [
        'signup-layout',
        'signup-layout-new'
    ];

    $ctrl.STEP_INFO_GENERAL = 1;
    $ctrl.STEP_INFO_ME_APP = 2;
    $ctrl.STEP_SCAN_QR = 3;
    $ctrl.STEP_SELECT_ORGANIZATION = 4;
    $ctrl.STEP_ORGANIZATION_ADD = 5;
    $ctrl.STEP_OFFICES = 6;
    $ctrl.STEP_EMPLOYEES = 7;
    $ctrl.STEP_FUND_APPLY = 8;
    $ctrl.STEP_PROCESS_NOTICE = 9;
    $ctrl.STEP_DEMO_TRANSACTION = 10;
    $ctrl.STEP_SIGNUP_FINISHED = 11;

    $ctrl.INFO_STEPS = 2;
    $ctrl.DEMO_STEPS = 0;

    // hide header and add layout classes
    $rootScope.showAppHeader = false;
    $rootScope.layout = [
        'signup-layout',
        'signup-layout-new'
    ];

    $ctrl.step = $ctrl.STEP_INFO_GENERAL;
    $ctrl.signedIn = AuthService.hasCredentials();
    $ctrl.organization = null;
    $ctrl.hasApp = true;
    $ctrl.selectedOption = "";
    $ctrl.authEmailSent = false;
    $ctrl.authEmailRestoreSent = false;

    $ctrl.organizationStep = false;
    $ctrl.showLoginBlock = false;
    $ctrl.offices = [];
    $ctrl.employees = [];
    $ctrl.shareSmsSent = false;
    $ctrl.shareEmailSent = false;
    $ctrl.fundsAvailable = [];

    $ctrl.showAddOfficeBtn = true;
    $ctrl.isAddingNewOffice = false;

    $ctrl.loggedWithApp = progressStorage.has('logged-with-app');

    $ctrl.calcSteps = () => {
        $ctrl.STEP_INFO_GENERAL = 1;
        $ctrl.STEP_INFO_ME_APP = 2;

        if ($ctrl.signedIn) {
            $ctrl.STEP_SCAN_QR = null;
            $ctrl.STEP_SELECT_ORGANIZATION = 3;
            $ctrl.STEP_ORGANIZATION_ADD = 4;
            $ctrl.STEP_OFFICES = 5;
            $ctrl.STEP_EMPLOYEES = 6;
            $ctrl.STEP_FUND_APPLY = 7;
            $ctrl.STEP_PROCESS_NOTICE = 8;

            if (isMobile()) {
                $ctrl.STEP_SIGNUP_FINISHED = 9;
                $ctrl.shownSteps = [1, 2, 3, 4, 5, 6, /* 7, 8 */];
            } else {
                $ctrl.STEP_DEMO_TRANSACTION = 9;
                $ctrl.STEP_SIGNUP_FINISHED = 10;
                $ctrl.shownSteps = [1, 2, 3, 4, 5, 6, 7, /* 8 */];
            }
        } else {
            $ctrl.STEP_SCAN_QR = 3;
            $ctrl.STEP_SELECT_ORGANIZATION = 4;
            $ctrl.STEP_ORGANIZATION_ADD = 5;
            $ctrl.STEP_OFFICES = 6;
            $ctrl.STEP_EMPLOYEES = 7;
            $ctrl.STEP_FUND_APPLY = 8;
            $ctrl.STEP_PROCESS_NOTICE = 9;

            if (isMobile()) {
                $ctrl.STEP_SIGNUP_FINISHED = 10;
                $ctrl.shownSteps = [1, 2, 3, 4, 5, 6, 7, /* 8, 9 */];
            } else {
                $ctrl.STEP_DEMO_TRANSACTION = 10;
                $ctrl.STEP_SIGNUP_FINISHED = 11;
                $ctrl.shownSteps = [1, 2, 3, 4, 5, 6, 7, 8, /* 9 */];
            }
        }
    };

    $ctrl.restoreProgress = () => {
        let step = parseInt(progressStorage.get('step'));
        let stepsAvailable = $ctrl.signedIn ? [
            $ctrl.STEP_INFO_ME_APP,
            $ctrl.STEP_SELECT_ORGANIZATION,
            $ctrl.STEP_ORGANIZATION_ADD,
            $ctrl.STEP_OFFICES,
            $ctrl.STEP_EMPLOYEES,
            $ctrl.STEP_FUND_APPLY,
            $ctrl.STEP_PROCESS_NOTICE,
            $ctrl.STEP_DEMO_TRANSACTION,
            $ctrl.STEP_SIGNUP_FINISHED,
        ] : [
                $ctrl.STEP_INFO_ME_APP,
                $ctrl.STEP_SCAN_QR,
                $ctrl.STEP_SELECT_ORGANIZATION,
                $ctrl.STEP_ORGANIZATION_ADD,
                $ctrl.STEP_OFFICES,
                $ctrl.STEP_EMPLOYEES,
                $ctrl.STEP_FUND_APPLY,
                $ctrl.STEP_PROCESS_NOTICE,
                $ctrl.STEP_DEMO_TRANSACTION,
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
        let authTarget = [
            'newSignup',
            $stateParams.organization_id,
            $stateParams.fund_id,
            $stateParams.tag,
        ].join('-');

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
                        $ctrl.confirmationEmail = form.values.email;
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

            if (typeof (values.iban) === 'string') {
                values.iban = values.iban.replace(/\s/g, '');
            }

            return SignUpService.organizationStore(values);
        }, true);
    }

    $ctrl.buildEmployeeForm = (values) => {
        return FormBuilderService.build(values, async (form) => {
            form.lock();

            let promise;
            let operation_officer = 5;

            // Role operation_officer
            form.values.roles = [operation_officer];

            if (form.values.id) {
                promise = OrganizationEmployeesService.update(
                    $ctrl.organization.id,
                    form.values.id,
                    form.values
                )
            } else {
                promise = OrganizationEmployeesService.store(
                    $ctrl.organization.id,
                    form.values
                )
            }

            promise.then(res => {
                if (!form.values.id) {
                    $ctrl.employees.push(res.data.data);
                } else {
                    let employee = $ctrl.employees.filter(
                        (employee) => employee.id == form.values.id
                    )[0];

                    for (let value in form.values) {
                        employee[value] = form.values[value];
                    }
                }

                $ctrl.enableSaveEmployeeBtn = false;
                $ctrl.enableAddEmployeeBtn = true;
            }, (res) => {
                if (res.status == '429') {
                    form.errors = {
                        email: new Array(res.data.message)
                    };
                } else {
                    form.errors = res.data.errors;
                }

                form.unlock();

                $ctrl.enableSaveEmployeeBtn = true;
                $ctrl.enableAddEmployeeBtn = false;
            });
        });
    };

    $ctrl.$onInit = function() {
        $ctrl.signUpForm = $ctrl.makeSignUpForm();
        $ctrl.organizationForm = $ctrl.makeOrganizationForm();

        $ctrl.calcSteps();
        $ctrl.restoreProgress();

        $scope.phoneForm = FormBuilderService.build({
            phone: "06"
        }, function(form) {
            return ShareService.sendSms({
                phone: "+31" + form.values.phone.substr(1),
            });
        }, true);

        $scope.emailForm = FormBuilderService.build({
            email: ""
        }, function(form) {
            return ShareService.sendEmail(form.values);
        }, true);
    };

    $ctrl.deleteOffice = (office) => {
        OfficeService.destroy(office.organization_id, office.id).then((res) => {
            $ctrl.offices = $ctrl.offices.filter((_office) => {
                return typeof _office.id == 'undefined' || _office.id != office.id;
            });
        });
    };

    $ctrl.editOffice = (office) => {
        office.edit = true;
        $ctrl.showAddOfficeBtn = false;
        $ctrl.isAddingNewOffice = false;
    };

    $ctrl.officeUpdated = (office) => {
        office.edit = false;
        loadOrganizationOffices($ctrl.organization);
    };

    $ctrl.cancelOfficeEdit = (office) => {
        office.edit = false;
    }

    $ctrl.addOffice = () => {
        $ctrl.isAddingNewOffice = true;
        $ctrl.showAddOfficeBtn = false;
    };

    $ctrl.cancelOfficeAdd = () => {
        $ctrl.isAddingNewOffice = false;
        $ctrl.showAddOfficeBtn = true;
    }

    $ctrl.officeCreated = () => {
        loadOrganizationOffices($ctrl.organization);
        $ctrl.cancelOfficeAdd();
    };

    $ctrl.saveOffice = () => {
        $ctrl.officeForm.submit();
        loadOrganizationOffices($ctrl.organization);
    };

    $ctrl.selectOrganization = (organization) => {
        $ctrl.selectedOrganization = organization;
        $ctrl.setOrganization($ctrl.selectedOrganization);
        $ctrl.setStep($ctrl.STEP_OFFICES);
    };

    $ctrl.addOrganization = () => {
        $ctrl.setStep($ctrl.STEP_ORGANIZATION_ADD);
    };

    $ctrl.cancelAddOrganization = () => {
        $ctrl.setStep($ctrl.STEP_SELECT_ORGANIZATION);
    };

    $ctrl.blurInput = () => {
        if ("activeElement" in document) {
            document.activeElement.blur();
        }
    }

    $ctrl.saveEmployee = () => {
        $ctrl.blurInput();

        ModalService.open('employeeAddConfirmation', {
            email: $ctrl.employeeForm.values.email,
            success: (data) => {
                if (data.allow) {
                    $ctrl.employeeForm = $ctrl.buildEmployeeForm($ctrl.employeeForm.values);
                    $ctrl.employeeForm.submit();
                }
            }
        });
    };

    $ctrl.deleteEmployee = function(employee) {
        OrganizationEmployeesService.destroy($ctrl.organization.id, employee.id).then((res) => {
            $ctrl.employees = $ctrl.employees.filter((_employee) => {
                return _employee.id == 'undefined' || _employee.id != employee.id;
            });
        });
    };

    let loadOrganizationOffices = (organization) => {
        OfficeService.list(organization.id, {
            per_page: 100
        }).then((res) => {
            if (!res.data.data.length) {
                return $ctrl.addOffice();
            }

            $ctrl.offices = res.data.data;
        });
    };

    $ctrl.loadOrganizations = () => {
        return $q((resolve, reject) => SignUpService.organizations({
            per_page: 100,
        }).then(res => resolve($ctrl.organizationList = res.data.data), reject));
    };

    let loadEmployees = (organization) => {
        OrganizationEmployeesService.list(organization.id).then((res) => {
            if (res.data.data.length) {
                $ctrl.employees = res.data.data.filter(employee => {
                    return employee.identity_address != $scope.$root.auth_user.address;
                });
            } else {
                $ctrl.addEmployee();
            }
        });
    };

    $ctrl.filters = {
        values: {
            q: "",
            per_page: 10
        },
    };

    $ctrl.onFundsAvailablePageChange = (query) => {
        getAvailableFunds($ctrl.organization, query);
    };

    let getAvailableFunds = (organization, query) => {
        ProviderFundService.listAvailableFunds(organization.id, query).then(res => {
            let fundsAvailable = $ctrl.fundsAvailable = {
                meta: res.data.meta,
                data: res.data.data
            };

            if ($stateParams.fundId && fundsAvailable.meta.total > 0) {
                let targetFund = fundsAvailable.data.filter(
                    fund => fund.id == $stateParams.fundId
                )[0] || null;

                if (targetFund) {
                    return ProviderFundService.applyForFund(
                        organization.id,
                        targetFund.id
                    ).then($ctrl.next);
                }
            }
        });
    };

    const loadAvailableFunds = (organization) => {
        $ctrl.showFilters = !$stateParams.organization_id && !$stateParams.tag && !$stateParams.fund_id;
        const search_params = $ctrl.filters.values;

        if (!$ctrl.showFilters) {
            if ($stateParams.organization_id) {
                search_params.organization_id = $stateParams.organization_id;
            }

            if ($stateParams.tag) {
                search_params.tag = $stateParams.tag;
            }

            if ($stateParams.fund_id) {
                search_params.fund_id = $stateParams.fund_id;
            }
        }

        getAvailableFunds(organization, search_params);
    };

    $ctrl.setStep = (step) => {
        let movingForward = step >= $ctrl.step;

        if (isMobile() && step == $ctrl.STEP_INFO_ME_APP) {
            $ctrl.step = step;
            return movingForward ? $ctrl.next() : $ctrl.back();
        }

        if (step <= $ctrl.STEP_SIGNUP_FINISHED) {
            $ctrl.step = step;
            progressStorage.set('step', step);

            if ($ctrl.step == $ctrl.STEP_SCAN_QR) {
                if (isMobile()) {
                    $ctrl.setHasAppProp(false);
                } else {
                    $ctrl.requestAuthQrToken();
                }
            }

            if ($ctrl.step == $ctrl.STEP_SELECT_ORGANIZATION) {
                $ctrl.loadOrganizations().then((organizations) => {
                    if (organizations.length == 0) {
                        $ctrl.setStep($ctrl.STEP_ORGANIZATION_ADD);
                    }
                });
            }

            if ($ctrl.step >= $ctrl.STEP_ORGANIZATION_ADD && progressStorage.has('organizationForm')) {
                $ctrl.organizationForm.values = JSON.parse(progressStorage.get('organizationForm'));
                $ctrl.setOrganization($ctrl.organizationForm.values);
            }

            if (step == $ctrl.STEP_OFFICES && $ctrl.organization) {
                loadOrganizationOffices($ctrl.organization);
            }

            if ((step == $ctrl.STEP_EMPLOYEES) && $ctrl.organization) {
                loadEmployees($ctrl.organization);
            }

            if ((step == $ctrl.STEP_FUND_APPLY) && $ctrl.organization) {
                loadAvailableFunds($ctrl.organization);
            }

            if (step == $ctrl.STEP_DEMO_TRANSACTION) {
                DemoTransactionService.store().then(res => {
                    $ctrl.demoToken = res.data.data.token;

                    let interval = $interval(() => {
                        DemoTransactionService.read($ctrl.demoToken).then(res => {

                            if (res.data.data.state != 'pending') {
                                $interval.cancel(interval);
                                $ctrl.step = $ctrl.STEP_SIGNUP_FINISHED;
                            }
                        });
                    }, 2000);
                });
            }

            if ($ctrl.step == $ctrl.STEP_CREATE_PROFILE) {
                $ctrl.setHasAppProp(JSON.parse(progressStorage.get('hasApp', 'false')));
            }
        }

        if (isMobile() && step == $ctrl.STEP_PROCESS_NOTICE) {
            progressStorage.clear();
        }

        // last step, time for progress cleanup
        if (step >= $ctrl.STEP_SIGNUP_FINISHED) {
            progressStorage.clear();
        }
    };

    $ctrl.setOrganization = (organization) => {
        $ctrl.organization = organization;
        progressStorage.set('organizationForm', JSON.stringify(organization));
    };

    $scope.$watch('phoneForm.values.phone', (newValue, oldValue, scope) => {
        $ctrl.phoneNumberFilled = newValue.length == 10;
    });

    $ctrl.sendSms = () => {
        if (waitingSms) {
            return;
        }

        let promise = $scope.phoneForm.submit();

        if (promise) {
            waitingSms = true;

            promise.then(() => {
                $ctrl.shareSmsSent = true;
                waitingSms = false;
                $scope.phoneForm.unlock();
            }, (res) => {
                waitingSms = false;
                $scope.phoneForm.unlock();
                $scope.phoneForm.errors = res.data.errors || { phone: [res.data.message] };
            });
        }
    };

    $ctrl.sendEmail = () => {
        if (waitingSms) {
            return;
        }

        let promise = $scope.emailForm.submit();

        if (promise) {
            waitingSms = true;

            promise.then(() => {
                $ctrl.shareEmailSent = true;
                waitingSms = false;
                $scope.emailForm.unlock();
            }, (res) => {
                waitingSms = false;
                $scope.emailForm.unlock();
                $scope.emailForm.errors = res.data.errors || { email: [res.data.message] };
            });
        }
    };

    $ctrl.next = function() {
        if ($ctrl.step == $ctrl.STEP_ORGANIZATION_ADD) {
            let submit = () => $ctrl.organizationForm.submit().then((res) => {
                $ctrl.setOrganization(res.data.data);
                $ctrl.setStep($ctrl.STEP_OFFICES);
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
        if ($ctrl.step == $ctrl.STEP_OFFICES) {
            progressStorage.delete('organizationForm');
            $ctrl.setStep($ctrl.step - 2);
        } else {
            $ctrl.setStep($ctrl.step - 1);
        }

        loginQrBlock.hide();
    };

    $ctrl.resetShareForms = () => {
        $ctrl.shareSmsSent = false;
        $ctrl.shareEmailSent = false;
        $ctrl.appDownloadSkip = false;

        $scope.emailForm.values.email = '';
        $scope.phoneForm.values.phone = '';
    };

    $ctrl.showLoginQrCode = function() {
        $ctrl.requestAuthQrToken();
        loginQrBlock.show();
    };

    let loginQrBlock = new (function() {
        this.show = () => $ctrl.showLoginBlock = true;
        this.hide = () => $ctrl.showLoginBlock = false;
    });


    $ctrl.requestAuthQrToken = () => {
        IdentityService.makeAuthToken().then(res => {
            $ctrl.authToken = res.data.auth_token;

            authTokenSubscriber.checkAccessTokenStatus(res.data.access_token, () => {
                $ctrl.calcSteps();
                $ctrl.signedIn = $ctrl.loggedWithApp = true;
                progressStorage.set('logged-with-app', $ctrl.loggedWithApp);

                if ($ctrl.step == $ctrl.STEP_SCAN_QR) {
                    $ctrl.setStep($ctrl.STEP_SELECT_ORGANIZATION);
                } else {
                    $ctrl.next();
                }
            });
        }, console.error);
    };

    $ctrl.selectPhoto = (file) => {
        orgMediaFile = file;
    };

    $scope.authorizePincodeForm = FormBuilderService.build({
        auth_code: "",
    }, (form) => IdentityService.authorizeAuthCode(
        form.values.auth_code
    ), true);

    $ctrl.$onDestroy = function() {
        progressStorage.clear();
        authTokenSubscriber.stopCheckAccessTokenStatus();
    };

    $ctrl.finish = () => $state.go('organizations-view', { id: $ctrl.organization.id });
    $ctrl.openAuthPopup = () => $state.go('home');
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
        '$filter',
        '$interval',
        'OfficeService',
        'IdentityService',
        'FormBuilderService',
        'OrganizationEmployeesService',
        'MediaService',
        'ShareService',
        'DemoTransactionService',
        'ProviderFundService',
        'AuthService',
        'ModalService',
        'SignUpService',
        ProviderSignUpComponent
    ],
    templateUrl: 'assets/tpl/pages/provider-sign-up.html'
};