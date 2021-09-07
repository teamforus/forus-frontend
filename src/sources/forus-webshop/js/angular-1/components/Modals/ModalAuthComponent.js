const ModalAuthComponent = function(
    $state,
    $timeout,
    $rootScope,
    AuthService,
    IdentityService,
    FormBuilderService,
    CredentialsService,
    DigIdService,
    ModalService,
    appConfigs
) {
    const $ctrl = this;
    const index = Math.floor(Math.random() * 100000) + 1;

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
        }, (res) => {
            $ctrl.close();

            $state.go('error', {
                errorCode: res.headers('Error-Code'),
            });
        });
    }

    $ctrl.$onInit = () => {
        $ctrl.appConfigs = appConfigs;

        angular.element(document).bind('keydown.auth_model_' + index, (e) => {
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
        }, async (form) => {
            const handleErrors = (res) => {
                form.unlock();
                form.errors = res.data.errors ? res.data.errors : {
                    email: [res.data.message]
                };
            };

            const used = await new Promise((resolve) => {
                IdentityService.validateEmail(form.values).then(res => {
                    resolve(res.data.email.used);
                }, handleErrors);
            });

            if (!used) {
                $ctrl.close();
                return $state.go('start', { email_address: form.values.email });
            }

            IdentityService.makeAuthEmailToken(form.values.email).then(() => {
                $ctrl.screen = 'sign_in-email-sent';
                $ctrl.close();

                ModalService.open('modalNotification', {
                    type: 'action-result',
                    class: 'modal-description-pad',
                    email: form.values.email,
                    icon: "email_signup",
                    icon_filetype: ".svg",
                    title: 'popup_auth.labels.mail_sent',
                    description: 'popup_auth.notifications.link_' + appConfigs.features.communication_type,
                    confirmBtnText: 'popup_auth.buttons.submit'
                });
            }, (res) => handleErrors);
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
        }, console.error);
    };

    $ctrl.stopQrCodeVerification = () => $timeout.cancel(timeout);

    $ctrl.$onDestroy = () => {
        $ctrl.stopQrCodeVerification();
        angular.element(document).unbind('keydown.auth_model_' + index);
    };

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
        'AuthService',
        'IdentityService',
        'FormBuilderService',
        'CredentialsService',
        'DigIdService',
        'ModalService',
        'appConfigs',
        ModalAuthComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-auth.html';
    }
};