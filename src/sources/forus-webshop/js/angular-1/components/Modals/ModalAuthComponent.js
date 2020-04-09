let ModalAuthComponent = function(
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
            IdentityService.makeAuthEmailToken(form.values.email).then(() => {
                $ctrl.screen = 'sign_in-email-sent';
                $ctrl.close();

                ModalService.open('modalNotification', {
                    type: 'action-result',
                    class: 'modal-description-pad',
                    title: 'popup_auth.labels.join',
                    description: 'popup_auth.notifications.link',
                    confirmBtnText: 'popup_auth.buttons.submit'
                });

            }, (res) => {
                form.unlock();
                form.errors = res.data.errors;
            });
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
                    $state.go('vouchers');
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