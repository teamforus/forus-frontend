let ModalAuthComponent = function(
    $timeout,
    $state,
    $rootScope,
    AuthService,
    IdentityService,
    FormBuilderService,
    CredentialsService,
    DigIdService,
    ModalService,
    PermissionsService,
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
        IdentityService.identity().then(() => {}, $ctrl.close);
    }

    $ctrl.useDigId = () => {
        $ctrl.restoreWithDigId = true;
        $ctrl.stopQrCodeVerification();
    }

    $ctrl.startDigId = () => {
        DigIdService.startAuthRestore().then((res) => {
            document.location = res.data.redirect_url;
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
        $ctrl.requestAuthQrToken();
        $ctrl.showEmailForm();
    };

    $ctrl.showQrForm = function() {
        $ctrl.showQrCodeBlock = true;
        $ctrl.showChoose = false;

        $ctrl.requestAuthQrToken();
    };

    $ctrl.checkAccessTokenStatus = (type, access_token) => {
        IdentityService.checkAccessToken(access_token).then((res) => {
            if (res.data.message == 'active') {
                CredentialsService.set(access_token);

                if (['provider'].indexOf(appConfigs.panel_type) != -1) {
                    $rootScope.loadAuthUser().then(() => {
                        $ctrl.close();
                        $state.go('organizations');
                    });
                } else {
                    $ctrl.close();
                    $rootScope.loadAuthUser().then(() => $state.go('organizations'));
                }
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

    $ctrl.showEmailForm = function() {
        $ctrl.showEmailBlock = true;
        $ctrl.showChoose = false;

        $ctrl.signInEmailForm = FormBuilderService.build({}, (form) => {
            IdentityService.makeAuthEmailToken(form.values.email).then(() => {
                $ctrl.screen = 'sign_in-email-sent';
                $ctrl.close();

                ModalService.open('modalNotification', {
                    type: 'action-result',
                    class: 'modal-description-pad modal-content',
                    email: form.values.email,
                    icon: 'icon-sign_up-success',
                    title: 'popup_auth.labels.mail_sent',
                    description: 'popup_auth.notifications.link',
                    confirmBtnText: 'popup_auth.buttons.confirm',
                });

            }, (res) => {
                form.unlock();
                form.errors = res.data.errors ? res.data.errors : {
                    email: [res.data.message]
                };
            });
        }, true);

    };

    $ctrl.stopQrCodeVerification = () => $timeout.cancel(timeout);
    $ctrl.$onDestroy = () => $ctrl.stopQrCodeVerification();
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$timeout',
        '$state',
        '$rootScope',
        'AuthService',
        'IdentityService',
        'FormBuilderService',
        'CredentialsService',
        'DigIdService',
        'ModalService',
        'PermissionsService',
        'appConfigs',
        ModalAuthComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-auth.html';
    }
};