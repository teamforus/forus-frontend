let ModalAuth2Component = function(
    $timeout,
    $rootScope,
    AuthService,
    IdentityService,
    FormBuilderService,
    CredentialsService,
    ModalService
) {
    let $ctrl = this;

    let qrCodeEl;
    let timeout;

    $ctrl.qrValue = null;
    $ctrl.showChoose = true;
    $ctrl.showQrCodeBlock = false;
    $ctrl.showEmailBlock = false;

    $ctrl.showChoose = true;
    $ctrl.showQrCodeBlock = false;
    $ctrl.showEmailBlock = false;
    
    if (AuthService.hasCredentials()) {
        IdentityService.identity().then(() => { }, $ctrl.close);
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
        $ctrl.showEmailForm();
    };

    $ctrl.showQrForm = function() {
        $ctrl.showQrCodeBlock = true;
        $ctrl.showChoose = false;

        $ctrl.requestAuthQrToken();
    };

    $ctrl.applyAccessToken = function(access_token) {
        CredentialsService.set(access_token);
        $rootScope.loadAuthUser();
        $ctrl.close();
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
            $ctrl.qrValue = $ctrl.authToken;

            $ctrl.checkAccessTokenStatus('token', res.data.access_token);
        }, console.error);
    };

    $ctrl.showEmailForm = function() {

        $ctrl.showEmailBlock = true;
        $ctrl.showChoose = false;
        $ctrl.signInEmailForm = FormBuilderService.build({
            email: "",
        }, function(form) {
            form.lock();
            IdentityService.makeAuthEmailToken(form.values.email).then((res) => {
                $ctrl.screen = 'sign_in-email-sent';

                $ctrl.close();
                ModalService.open('modalNotification', {
                    type: 'action-result',
                    class: 'modal-description-pad modal-content',
                    icon: 'email_confirmation',
                    title: 'popup_auth.labels.mail_sent',
                    description: 'popup_auth.notifications.link_website',
                    confirmBtnText: 'popup_auth.buttons.close'
                });

            }, (res) => {
                form.unlock();
                form.errors = res.data.errors;
            });
        });

    };

    $ctrl.$onDestroy = function() {
        $timeout.cancel(timeout);
        qrCodeEl.innerHTML = '';
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$timeout',
        '$rootScope',
        'AuthService',
        'IdentityService',
        'FormBuilderService',
        'CredentialsService',
        'ModalService',
        ModalAuth2Component
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-auth2.html';
    }
};