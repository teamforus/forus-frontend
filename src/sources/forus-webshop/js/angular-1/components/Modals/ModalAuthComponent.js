let ModalAuthComponent = function(
    $state,
    $timeout,
    $rootScope,
    $q,
    AuthService,
    IdentityService,
    FormBuilderService,
    CredentialsService,
    DigIdService,
    ModalService,
    FundService,
    appConfigs
) {
    let $ctrl = this;
    let timeout;

    $ctrl.qrValue = null;
    $ctrl.showChoose = true;
    $ctrl.showQrCodeBlock = false;
    $ctrl.showEmailBlock = false;

    $ctrl.digidAvailable = appConfigs.features.digid;
    $ctrl.restoreWithDigId = false;

    if (AuthService.hasCredentials()) {
        IdentityService.identity().then(() => { }, $ctrl.close);
    }

    $ctrl.showQrForm = function() {
        $ctrl.showQrCodeBlock = true;
        $ctrl.showChoose = false;

        $ctrl.requestAuthQrToken();
    };

    $ctrl.useDigId = () => {
        $ctrl.restoreWithDigId = true;
        $ctrl.stopQrCodeVerification();
    }

    $ctrl.startDigId = () => {
        DigIdService.startAuthRestore().then((res) => {
            document.location = res.data.redirect_url;
        }, res => {
            $ctrl.close();

            $state.go('error', {
                errorCode: res.headers('Error-Code')
            });
        });
    }

    $ctrl.getFunds = () => {
        return $q((resolve) => {
            FundService.list(null, {
                check_criteria: 1
            }).then(res => resolve(res.data.data));
        });
    }

    $ctrl.$onInit = () => {
        $(document).bind('keydown', (e) => {
            $timeout(function() {
                var key = e.charCode || e.keyCode || 0;

                if (key == 27) {
                    $ctrl.close();
                }
            }, 0);
        });

        $ctrl.showQrForm();

        $ctrl.signInEmailForm = FormBuilderService.build({
            email: ""
        }, (form) => {
            let authTarget = undefined;

            if ($ctrl.modal.scope.has_redirect) {
                authTarget = [$ctrl.modal.scope.target_name].concat(
                    Object.values($ctrl.modal.scope.target_params)
                );

                authTarget = authTarget.join('-');
            }

            let resolveErrors = (res) => {
                form.unlock();
                form.errors = res.data.errors ? res.data.errors : { email: [res.data.message] };
            };

            IdentityService.validateEmail(form.values).then(res => {
                if (!res.data.email.used) {
                    $ctrl.getFunds().then(funds => {
                        let fund_id = funds[0].id;

                        let authTarget = [
                            'fundRequest',
                            fund_id,
                        ].join('-');

                        IdentityService.make(Object.assign(form.values, {
                            target: authTarget
                        })).then(() => {
                            $ctrl.authEmailSent = true;
                            $ctrl.confirmationEmail = form.values.email;

                            $ctrl.close();
                            
                            $state.go('fund-request', {
                                fund_id: fund_id,
                                email_address: form.values.email,
                                email_confirm: true
                            });
                        }, resolveErrors);
                    });
                } else {
                    IdentityService.makeAuthEmailToken(
                        form.values.email,
                        authTarget
                    ).then(() => {
                        $ctrl.screen = 'sign_in-email-sent';
                        $ctrl.close();

                        ModalService.open('modalNotification', {
                            type: 'action-result',
                            class: 'modal-description-pad',
                            email: form.values.email,
                            icon: "email_signup",
                            title: 'popup_auth.labels.mail_sent',
                            description: 'popup_auth.notifications.link',
                            confirmBtnText: 'popup_auth.buttons.submit'
                        });
                    }, resolveErrors);
                }

            }, resolveErrors);
        }, true);
    };


    $ctrl.applyAccessToken = function(access_token) {
        CredentialsService.set(access_token);
        $rootScope.$broadcast('auth:update');
        $ctrl.close();
    };

    $ctrl.checkAccessTokenStatus = (type, access_token) => {
        IdentityService.checkAccessToken(access_token).then((res) => {
            if (res.data.message == 'active') {
                $ctrl.applyAccessToken(access_token);
                $timeout(function() {
                    if ($ctrl.modal.scope.has_redirect) {
                        $state.go($ctrl.modal.scope.target_name, $ctrl.modal.scope.target_params);
                    } else {
                        $state.go('vouchers');
                    }
                }, 2500);
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

            $ctrl.qrValue = $ctrl.authToken;

            $ctrl.checkAccessTokenStatus('token', res.data.access_token);
        }, console.log);
    };

    $ctrl.stopQrCodeVerification = () => $timeout.cancel(timeout);
    $ctrl.$onDestroy = () => $ctrl.stopQrCodeVerification();

    $ctrl.openAuthCodePopup = function() {
        $ctrl.close();

        ModalService.open('modalAuthCode', {});
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$state',
        '$timeout',
        '$rootScope',
        '$q',
        'AuthService',
        'IdentityService',
        'FormBuilderService',
        'CredentialsService',
        'DigIdService',
        'ModalService',
        'FundService',
        'appConfigs',
        ModalAuthComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-auth.html';
    }
};