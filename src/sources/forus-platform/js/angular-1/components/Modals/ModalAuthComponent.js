let ModalAuthComponent = function(
    $filter,
    $timeout,
    $state,
    $rootScope,
    AuthService,
    IdentityService,
    FormBuilderService,
    CredentialsService,
    ModalService,
    appConfigs
) {
    let $ctrl = this;

    let timeout;

    let $redirectAuthorizedState = 'organizations';

    if (appConfigs.panel_type == 'validator') {
        $redirectAuthorizedState = 'csv-validation';
    }

    $ctrl.qrValue = null;
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
                $state.go($redirectAuthorizedState);
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

    $ctrl.showEmailForm = function() {

        $ctrl.showEmailBlock = true;
        $ctrl.showChoose = false;

        $ctrl.signInEmailForm = FormBuilderService.build({
            source: appConfigs.client_key + '_' + appConfigs.panel_type,
            primary_email: "",
        }, function(form) {
            form.lock();

            IdentityService.makeAuthEmailToken(
                form.values.source,
                form.values.primary_email
            ).then((res) => {
                localStorage.setItem('pending_email_token', res.data.access_token);
                $ctrl.screen = 'sign_in-email-sent';

                $ctrl.close();

                ModalService.open('modalNotification', {
                    type: 'action-result',
                    class: 'modal-description-pad modal-content',
                    title: $filter('translate')('popup_auth.labels.join'),
                    description: $filter('translate')('popup_auth.notifications.link'),
                    confirmBtnText: $filter('translate')('popup_auth.buttons.confirm')
                });

            }, (res) => {
                form.unlock();
                form.errors = res.data.errors;
            });
        });

    };

    $ctrl.$onDestroy = function() {
        $timeout.cancel(timeout);
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$filter',
        '$timeout',
        '$state',
        '$rootScope',
        'AuthService',
        'IdentityService',
        'FormBuilderService',
        'CredentialsService',
        'ModalService',
        'appConfigs',
        ModalAuthComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-auth.html';
    }
};