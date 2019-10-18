let SignUpComponent = function(
    $q,
    $state,
    $stateParams,
    $scope,
    $rootScope,
    $timeout,
    $interval,
    $filter,
    OrganizationService,
    OfficeService,
    IdentityService,
    CredentialsService,
    FormBuilderService,
    MediaService,
    ProviderFundService,
    OrganizationEmployeesService,
    SmsService,
    appConfigs
) {
    let $ctrl = this;

    /*
     step 1 - app links
     step 2 - email and name form
     step 3 - organization form
     step 5 - pin code
     step 6 - qr code
     */
    $ctrl.step = 1;
    $ctrl.organizationStep = false;
    $ctrl.signedIn = !!$rootScope.auth_user;
    $ctrl.showLoginBlock = false;
    $ctrl.organization = null;
    $ctrl.fundsAvailable = [];
    $ctrl.offices = [];
    $ctrl.employees = [];
    $ctrl.sentSms = false;

    let has_app = false;
    let orgMediaFile = false;
    let waitingSms = false;
    let timeout;
    let officeMediaFile = false;

    let invalidPermissions = {
        sponsor: [
            "manage_provider_funds", "manage_products", "manage_offices",
            "scan_vouchers"
        ],
        provider: [
            "manage_funds", "manage_providers", "manage_validators",
            "validate_records", "scan_vouchers"
        ]
    } [appConfigs.panel_type];

    $ctrl.beforeInit = () => {
        if ($ctrl.signedIn) {
            OrganizationService.list().then(res => {
                $ctrl.organizations = res.data.data.filter(organization => {
                    return organization.permissions.filter((permission => {
                        return invalidPermissions.indexOf(permission) == -1;
                    })).length > 0;
                });

                if ($ctrl.organizations.length == 0) {
                    $ctrl.setStep(3);
                } else if ($ctrl.organizations.length == 1) {
                    $ctrl.organization = $ctrl.organizations[0];
                    loadOrganizationOffices($ctrl.organization);
                    loadAvailableFunds($ctrl.organization);
                    $ctrl.setStep(4);
                } else {
                    //$state.go('organizations');
                    //progressStorage.clear();
                }
            });
        }
    };

    $ctrl.afterInit = () => {

    };

    let progressStorage = new(function() {
        let interval;

        this.init = () => {
            let step = this.getStep();

            if (step != null) {
                if (step == 3 && !$ctrl.signedIn) {
                    step = 2;
                }

                $ctrl.setStep(step);
            }

            if (localStorage.getItem('sign_up_form.signUpForm') != null) {
                $ctrl.signUpForm.values = JSON.parse(
                    localStorage.getItem('sign_up_form.signUpForm')
                );
            }

            if (localStorage.getItem('sign_up_form.organizationForm') != null) {
                $ctrl.organizationForm.values = JSON.parse(
                    localStorage.getItem('sign_up_form.organizationForm')
                );
            }

            interval = $interval(() => {
                if ($ctrl.step == 2) {
                    if ($ctrl.signUpForm.values) {
                        localStorage.setItem('sign_up_form.signUpForm', JSON.stringify(
                            $ctrl.signUpForm.values
                        ));
                    }
                } else if ($ctrl.step == 3) {
                    if ($ctrl.organizationForm.values) {
                        localStorage.setItem('sign_up_form.organizationForm', JSON.stringify(
                            $ctrl.organizationForm.values
                        ));
                    }
                }
            }, 500);
        };

        this.destroy = () => {
            $interval.cancel(interval);
        };

        this.setStep = (step) => {
            localStorage.setItem('sign_up_form.step', step);
        };

        this.getStep = () => {
            let step = parseInt(localStorage.getItem('sign_up_form.step'));

            return isNaN(step) ? null : step;
        };

        this.clear = () => {
            $interval.cancel(interval);

            localStorage.removeItem('sign_up_form.step');
            localStorage.removeItem('sign_up_form.signUpForm');
            localStorage.removeItem('sign_up_form.organizationForm');
        };
    })();

    $ctrl.chageBusinessType = (value) => {
        $ctrl.organizationForm.values.business_type_id = value.id;
    };

    $ctrl.buildOfficeForm = (values) => {
        return FormBuilderService.build(values, async (form) => {
            form.lock();
    
            let promise;
    
            if (officeMediaFile) {
                let res = await MediaService.store('office_photo', officeMediaFile);
    
                $ctrl.media = res.data.data;
                $ctrl.form.values.media_uid = $ctrl.media.uid;
                
                officeMediaFile = false;
            } else {
                delete $ctrl.officeForm.values.media_uid;
            }
    
            if ($ctrl.office) {
                promise = OfficeService.update(
                    $ctrl.organization.id,
                    $ctrl.office.id,
                    form.values
                )
            } else {
                promise = OfficeService.store(
                    $ctrl.organization.id,
                    form.values
                )
            }
    
            promise.then((res) => {
                if (!$ctrl.officeForm.values.id) {
                    $ctrl.offices.push(res.data.data);
                }
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
            });
        });
    };

    $ctrl.buildEmployeeForm = (values) => {
        return FormBuilderService.build(values, async (form) => {
            form.lock();
    
            let promise;
    
            if ($ctrl.employee) {
                promise = OrganizationEmployeesService.update(
                    $ctrl.organization.id,
                    $ctrl.office.id,
                    form.values
                )
            } else {
                promise = OrganizationEmployeesService.store(
                    $ctrl.organization.id,
                    form.values
                )
            }
            
            promise.then((res) => {
                if (!$ctrl.employeeForm.values.id) {
                    $ctrl.employees.push(res.data.data);
                }
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
            });
        });
    };

    $ctrl.$onInit = function() {
        $ctrl.requestAuthQrToken();

        $ctrl.beforeInit();

        $ctrl.signUpForm = FormBuilderService.build({
            pin_code: "1111",
        }, function(form) {
            let formValues = angular.copy(form.values);

            if (formValues.records) {
                delete formValues.records.primary_email_confirmation;
            }

            form.lock();

            return IdentityService.make(formValues);
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

        $scope.phoneForm = FormBuilderService.build({
            phone: "06"
        }, function(form) {
            form.lock();

            let phone = "+31" + form.values.phone.substr(1);
            let values = {
                phone: phone,
                title: $filter('translate')('sign_up.sms.body')
            };

            waitingSms = true;

            return SmsService.send(
                values
            );
        });

        $ctrl.officeForm = $ctrl.buildOfficeForm({});

        if ($ctrl.office && $ctrl.office.photo) {
            MediaService.read($ctrl.office.photo.uid).then((res) => {
                $ctrl.media = res.data.data;
            });
        }

        $ctrl.businessType = $ctrl.businessTypes.filter(
            option => option.id == $ctrl.organizationForm.values.business_type_id
        )[0] || null;

        progressStorage.init();

        $scope.$on('$destroy', progressStorage.destroy);

        $ctrl.afterInit();
    };

    $ctrl.deleteOffice = ($event, office) => {
        OfficeService.destroy(office.organization_id, office.id).then((res) => {
            $ctrl.offices = $ctrl.offices.filter((_office) => {
                _office.id == 'undefined' ||_office.id != office.id;
            });
        });

        $event.preventDefault();
        $event.stopPropagation();
    }

    $ctrl.editOffice = (office) => {
        $ctrl.officeForm = $ctrl.buildOfficeForm(office);

        $ctrl.enableSaveOfficeBtn = !$ctrl.enableSaveOfficeBtn;
        $ctrl.enableAddOfficeBtn  = !$ctrl.enableAddOfficeBtn;
    }

    $ctrl.addOffice = () => {
        if (!Array.isArray($ctrl.offices)) {
            $ctrl.offices = [];
        }

        $ctrl.officeForm = $ctrl.buildOfficeForm();

        $ctrl.enableSaveOfficeBtn = !$ctrl.enableSaveOfficeBtn;
        $ctrl.enableAddOfficeBtn  = !$ctrl.enableAddOfficeBtn;
    };

    $ctrl.saveOffice = () => {
        $ctrl.officeForm = $ctrl.buildOfficeForm($ctrl.officeForm.values);

        $ctrl.officeForm.submit().then((res) => {
            $ctrl.enableSaveOfficeBtn = !$ctrl.enableSaveOfficeBtn;
            $ctrl.enableAddOfficeBtn  = !$ctrl.enableAddOfficeBtn;
        });
    }

    $ctrl.saveEmployee = () => {
        $ctrl.employeeForm = $ctrl.buildOfficeForm($ctrl.employeeForm.values);

        $ctrl.employeeForm.submit().then((res) => {
            $ctrl.enableSaveEmployeeBtn = !$ctrl.enableSaveEmployeeBtn;
            $ctrl.enableAddEmployeeBtn  = !$ctrl.enableAddEmployeeBtn;
        });
    }

    $ctrl.addEmployee = () => {
        if (!Array.isArray($ctrl.employees)) {
            $ctrl.employees = [];
        }

        $ctrl.employeeForm = $ctrl.buildEmployeeForm();

        $ctrl.enableSaveEmployeeBtn = !$ctrl.enableSaveEmployeeBtn;
        $ctrl.enableAddEmployeeBtn  = !$ctrl.enableAddEmployeeBtn;
    }

    $ctrl.editEmployee = (employee) => {
        $ctrl.employeeForm = $ctrl.buildOfficeForm(employee);

        $ctrl.enableSaveEmployeeBtn = !$ctrl.enableSaveEmployeeBtn;
        $ctrl.enableAddEmployeeBtn  = !$ctrl.enableAddEmployeeBtn;
    };

    $ctrl.deleteEmployee = function(employee) {
        OrganizationEmployeesService.destroy(office.organization_id, office.id).then((res) => {
            $ctrl.employees = $ctrl.employees.filter((_employee) => {
                _employee.id == 'undefined' ||_employee.id != employee.id;
            });
        });

        $event.preventDefault();
        $event.stopPropagation();
    }

    $ctrl.changeHasApp = function() {
        has_app = !has_app;
    };

    $ctrl.skipToStep = (step) => {
        if (step == 7) {
            if ($ctrl.organization) {
                loadOrganizationOffices($ctrl.organization);
                loadAvailableFunds($ctrl.organization);
            }
        }

        $ctrl.setStep(step);
    };

    let loadOrganizationOffices = (organization) => {
        OfficeService.list(
            organization.id
        ).then((res) => {
            if (res.data.data.length) {
                $ctrl.offices = res.data.data;
            } else {
                $ctrl.addOffice();
            }
        });
    };

    let loadAvailableFunds = (organization) => {
        ProviderFundService.listAvailableFunds(
            organization.id, $stateParams.fundId ? {
                fund_id: $stateParams.fundId
            } : {}
        ).then((res) => {
            let fundsAvailable = res.data.data;

            if ($stateParams.fundId && fundsAvailable.length > 0) {
                let targetFund = fundsAvailable.filter(
                    fund => fund.id == $stateParams.fundId
                )[0] || null;

                if (targetFund) {
                    return ProviderFundService.applyForFund(
                        $ctrl.organization.id,
                        targetFund.id
                    ).then($ctrl.next);
                }
            }

            $ctrl.fundsAvailable = fundsAvailable;

            $scope.$watch(() => $ctrl.fundsAvailable, function(funds) {
                $ctrl.fundsLeft = (funds || []).filter(fund => {
                    return !fund.applied;
                });
            }, true);
        });
    };

    $ctrl.setStep = (step) => {
        $ctrl.step = step;

        if (step <= 3) {
            progressStorage.setStep($ctrl.step);
        } else {
            progressStorage.clear();
        }

        if (step == 7 && appConfigs.panel_type == 'sponsor') {
            $state.go('organizations');
        }
    };

    $ctrl.setOrganization = (organization) => {
        $ctrl.organization = organization;

        loadOrganizationOffices(organization);
    };

    $ctrl.enableSaveOfficeBtn = true;
    $ctrl.enableAddOfficeBtn = false;

    $ctrl.next = async function() {
        if ($ctrl.organizationStep && !$ctrl.signedIn && $ctrl.step > 1) {
            $ctrl.signUpForm.submit().then((res) => {
                CredentialsService.set(res.data.access_token);
                $ctrl.setStep($ctrl.step + 1);
                $ctrl.signedIn = true;
            }, (res) => {
                $ctrl.signUpForm.unlock();
                $ctrl.signUpForm.errors = res.data.errors;
            });

            return;
        }

        if ($ctrl.step == 1) {
            $ctrl.setStep($ctrl.step + 1);
        } else if ($ctrl.step == 2) {

            if (!waitingSms) {
                $scope.phoneForm.submit().then((res) => {
                    $ctrl.sentSms = true;
                }, (res) => {
                    $scope.phoneForm.unlock();
                    $scope.phoneForm.errors = res.data.errors;

                    if (res.status == 429) {
                        $scope.phoneForm.errors = {
                            phone: [$filter('translate')('sign_up.sms.error.try_later')]
                        };
                    }
                });
            }
        } else if ($ctrl.step == 3) {
            let authRes;

            if (!$ctrl.signedIn) {
                authRes = await $ctrl.signUpForm.submit().catch((res) => {
                    $ctrl.signUpForm.unlock();
                    $ctrl.signUpForm.errors = res.data.errors;
                    $ctrl.organizationStep = true;
                    $ctrl.setStep(2);
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
                $ctrl.setStep(4);
            }, (res) => {
                $ctrl.organizationForm.errors = res.data.errors;
                $ctrl.organizationForm.unlock();
            });

        } else if ($ctrl.step == 4) {
            $ctrl.setStep(5);
        } else if ($ctrl.step == 5) {

            $scope.authorizePincodeForm.submit().then((res) => {
                CredentialsService.set(null);

                $ctrl.requestAuthQrToken();
                $ctrl.setStep($ctrl.step + 1);

            }, (res) => {
                $scope.authorizePincodeForm.unlock();
                $scope.authorizePincodeForm.errors = res.data.errors;

                if (res.status == 404) {
                    $scope.authorizePincodeForm.errors = {
                        auth_code: ["Unknown code."]
                    };
                }
            });
        } else if ($ctrl.step == 6) {
            loadAvailableFunds($ctrl.organization);
            $ctrl.setStep($ctrl.step + 1);
        } else if ($ctrl.step == 7) {
            $state.go('organizations');
        }
    };

    $ctrl.back = function() {
        $ctrl.setStep($ctrl.step - 1);

        loginQrBlock.hide();
    };

    $ctrl.showLoginQrCode = function() {
        $ctrl.requestAuthQrToken();

        loginQrBlock.show();
    };

    let loginQrBlock = new(function() {
        this.show = () => {
            $ctrl.showLoginBlock = true;
        };

        this.hide = () => {
            $ctrl.showLoginBlock = false;
        };
    });

    $ctrl.applyAccessToken = function(access_token) {
        CredentialsService.set(access_token);
        $rootScope.$broadcast('auth:update');

        if ($ctrl.step == 2) {
            $ctrl.setStep(3);
        } else {
            $ctrl.next();
        }

        $ctrl.signedIn = true;
    };

    $ctrl.checkAccessTokenStatus = (type, access_token) => {
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

    $ctrl.readMoreFields = [
        'Smartphone',
        'Telefoonnummer',
        'IBAN nummer',
        'Persoonlijke email adres',
        'Email adres van uw bedrijf',
        'Kamer van koophandel nummer',
        'BTW-Nummer (optioneel)',
        'Email adressen van uw kassa medewerkers (optioneel)'
    ];

    $ctrl.weekDays = OfficeService.scheduleWeekDays();

    $ctrl.totalSteps = Array.from({length: 4}, (v, k) => k + 1);
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
        '$interval',
        '$filter',
        'OrganizationService',
        'OfficeService',
        'IdentityService',
        'CredentialsService',
        'FormBuilderService',
        'MediaService',
        'ProviderFundService',
        'OrganizationEmployeesService',
        'SmsService',
        'appConfigs',
        'ModalService',
        SignUpComponent
    ],
    templateUrl: 'assets/tpl/pages/sign-up.html'
};