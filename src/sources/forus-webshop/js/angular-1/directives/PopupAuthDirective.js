let PopupAuthDirective = function(
    $state,
    $scope,
    $timeout,
    $interval,
    $rootScope,
    AuthService,
    IdentityService,
    FormBuilderService,
    PrevalidationService,
    CredentialsService,
    ConfigService,
    FundService,
    appConfigs
) {
    let abortInterval;

    $scope.$watch('popup.screen', function(newValue) {
        if (newValue == 'sign_in-qr') {
            $ctrl.requestAuthQrToken();
        }

        if (newValue == 'activate-code') {
            $scope.activateCodeForm = FormBuilderService.build({
                code: "",
            }, function(form) {
                if (!form.values.code) {
                    form.errors.code = true;
                    return;
                }

                form.lock();

                PrevalidationService.redeem(form.values.code).then((res) => {
                    $scope.popup.close();

                    ConfigService.get().then((res) => {
                        if (!res.data.funds.list) {
                            FundService.applyToFirstAvailable().then(res => {
                                $state.go('voucher', res.data.data);
                            }, () => {
                                alert('Sorry no funds to apply to.');
                            });
                        } else if (res.data.records.list) {
                            $state.go('records');
                        } else {
                            $state.go('home');
                        }
                    });
                }, (res) => {
                    form.errors.code = true
                    form.unlock();
                });
            });
        }

        if (newValue == 'sign_up-code') {
            $scope.signUpForm = FormBuilderService.build({
                code: "",
                pin_code: "1111",
            }, function(form) {
                form.lock();

                IdentityService.make(form.values).then((res) => {
                    $ctrl.applyAccessToken(res.data.access_token);

                    PrevalidationService.redeem(
                        form.values.code
                    ).then(function() {
                        $scope.popup.close();

                        ConfigService.get().then((res) => {
                            if (!res.data.funds.list) {
                                FundService.applyToFirstAvailable().then(res => {
                                    $state.go('voucher', res.data.data);
                                }, () => {
                                    alert('Sorry no funds to apply to.');
                                });
                            } else if (res.data.records.list) {
                                $state.go('records');
                            } else {
                                $state.go('home');
                            }
                        });
                    }, console.error);
                }, (res) => {
                    form.unlock();
                    form.errors = res.data.errors;
                });
            });
        }

        if (newValue == 'sign_in-email') {
            $scope.signInEmailForm = FormBuilderService.build({
                source: "shop.test_shop",
                primary_email: "",
            }, function(form) {
                form.lock();

                IdentityService.makeAuthEmailToken(
                    form.values.source,
                    form.values.primary_email
                ).then((res) => {
                    localStorage.setItem('pending_email_token', res.data.access_token);
                    $scope.popup.open('sign_in-email-pending');
                }, (res) => {
                    form.unlock();
                    form.errors = res.data.errors;
                });
            });
        }

        if (newValue == 'sign_in-email-pending') {
            let access_token = localStorage.getItem('pending_email_token');

            if (access_token) {
                $ctrl.checkAccessTokenStatus('email', access_token);
            } else {
                $ctrl.stopEmailPending();
            }
        }

        if (newValue == 'authorize-pin_code') {
            $scope.authorizePincodeForm = FormBuilderService.build({
                auth_code: "",
            }, function(form) {
                form.lock();

                IdentityService.authorizeAuthCode(
                    form.values.auth_code
                ).then((res) => {
                    $scope.popup.open('authorize-pin_code-done');
                }, (res) => {
                    form.unlock();
                    form.errors = res.data.errors;

                    if (res.status == 404) {
                        form.errors = {
                            auth_code: ["Unknown code."]
                        };
                    }
                });
            });
        }
    });

    let $ctrl = this;
    let qrCodeEl;

    this.$onInit = function() {
        qrCodeEl = document.getElementById('auth_qrcode');
    }

    if (AuthService.hasCredentials()) {
        $scope.popup.close();
    }

    $ctrl.showModal = false;

    $ctrl.applyAccessToken = function(access_token) {
        CredentialsService.set(access_token);
        $rootScope.loadAuthUser();
        $scope.popup.close();
    };

    $ctrl.checkAccessTokenStatus = (type, access_token) => {
        if (abortInterval) {
            return abortInterval = false;
        }

        IdentityService.checkAccessToken(access_token).then((res) => {
            if (res.data.message == 'active') {
                $ctrl.stopEmailPending();
                $ctrl.applyAccessToken(access_token);
            } else if (res.data.message == 'pending') {
                $timeout(function() {
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

            new QRCode(qrCodeEl, {
                text: JSON.stringify({
                    type: 'auth_token',
                    'value': $ctrl.authToken
                })
            });

            qrCodeEl.removeAttribute('title');

            $ctrl.showModal = true;

            $ctrl.checkAccessTokenStatus('token', res.data.access_token);
        }, console.log);
    };

    $ctrl.closeModal = function() {
        $ctrl.showModal = false;
        qrCodeEl.innerHTML = '';
    };

    $ctrl.stopEmailPending = function() {
        abortInterval = true;
        localStorage.removeItem('pending_email_token');
        $scope.popup.close();
    };
};

module.exports = () => {
    return {
        scope: {
            popup: '='
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$state',
            '$scope',
            '$timeout',
            '$interval',
            '$rootScope',
            'AuthService',
            'IdentityService',
            'FormBuilderService',
            'PrevalidationService',
            'CredentialsService',
            'ConfigService',
            'FundService',
            'appConfigs',
            PopupAuthDirective
        ],
        templateUrl: 'assets/tpl/directives/popup-auth.html'
    };
};