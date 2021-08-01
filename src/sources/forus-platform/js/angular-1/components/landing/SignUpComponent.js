let SignUpComponent = function(
    $state,
    $scope,
    $rootScope,
    $timeout,
    $interval,
    $filter,
    IdentityService,
    CredentialsService,
    FormBuilderService,
    ShareService
) {
    let $ctrl = this;
    let $translate = $filter('translate');

    /*
     step 1 - app links
     step 2 - email and name form
     step 3 - pin code
     step 4 - qr code
     */
    $ctrl.step = 1;
    $ctrl.signedIn = !!$rootScope.auth_user;
    $ctrl.showLoginBlock = false;
    $ctrl.sentSms = false;

    let has_app = false;
    let waitingSms = false;
    let timeout;

    $ctrl.beforeInit = () => {};

    $ctrl.afterInit = () => {};

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

            interval = $interval(() => {
                if ($ctrl.step == 2) {
                    if ($ctrl.signUpForm.values) {
                        localStorage.setItem('sign_up_form.signUpForm', JSON.stringify(
                            $ctrl.signUpForm.values
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
        };
    })();

    $ctrl.$onInit = function() {
        $ctrl.beforeInit();

        $ctrl.signUpForm = FormBuilderService.build({
            pin_code: "1111",
        }, function(form) {
            let formValues = angular.copy(form.values);

            if (formValues.records) {
                delete formValues.records.primary_email_confirmation;
            }

            return IdentityService.make(formValues);
        }, true);

        $scope.phoneForm = FormBuilderService.build({
            phone: "06"
        }, function(form) {
            waitingSms = true;

            return ShareService.sendSms({
                phone: "+31" + form.values.phone.substr(1),
                type: 'me_app_download_link'
            });
        }, true);

        progressStorage.init();

        $scope.$on('$destroy', progressStorage.destroy);

        $ctrl.afterInit();
    };

    $ctrl.changeHasApp = function() {
        has_app = !has_app;
    };

    $ctrl.skipToStep = (step) => {
        $ctrl.setStep(step);
    };

    $ctrl.setStep = (step) => {
        $ctrl.step = step;

        if (step <= 2) {
            progressStorage.setStep($ctrl.step);
        } else {
            progressStorage.clear();
        }

        if (step == 6) {
            $state.go('home');
        }
    };

    $ctrl.next = function() {
        if ($ctrl.step == 1) {
            if (!waitingSms) {
                $scope.phoneForm.submit().then((res) => {
                    $ctrl.sentSms = true;
                }, (res) => {
                    $scope.phoneForm.unlock();
                    $scope.phoneForm.errors = res.data.errors;

                    if (res.status == 429) {
                        $scope.phoneForm.errors = {
                            phone: [
                                $translate('sign_up.sms.error.try_later')
                            ]
                        };
                    }
                });
            }

        } else if ($ctrl.step == 2) {
            if ($ctrl.signUpForm.values.email != $ctrl.signUpForm.values.email_confirmation) {
                $ctrl.signUpForm.errors = {
                    email_confirmation: [
                        $translate('validation.email_confirmation')
                    ]
                };
            } else {
                $ctrl.signUpForm.submit().then((res) => {
                    CredentialsService.set(res.data.access_token);
                    $ctrl.setStep($ctrl.step + 1);
                    $ctrl.signedIn = true;
                }, (res) => {
                    $ctrl.signUpForm.unlock();
                    $ctrl.signUpForm.errors = res.data.errors;
                });
            }
        } else if ($ctrl.step == 3) {
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
        } else if ($ctrl.step == 4) {
            $ctrl.setStep(5);
        } else if ($ctrl.step == 5) {
            $state.go('home');
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
        $ctrl.setStep($ctrl.step + 1);
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
        }, console.error);
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
};

module.exports = {
    controller: [
        '$state',
        '$scope',
        '$rootScope',
        '$timeout',
        '$interval',
        '$filter',
        'IdentityService',
        'CredentialsService',
        'FormBuilderService',
        'ShareService',
        SignUpComponent
    ],
    templateUrl: 'assets/tpl/pages/landing/sign-up.html'
};