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
    let $redirectAuthorizedState = null;

    if (appConfigs.panel_type == 'validator') {
        $redirectAuthorizedState = 'csv-validation';
    }

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
                    $rootScope.loadAuthUser().then(auth_user => {
                        $ctrl.close();

                        let organizations = auth_user.organizations.filter(organization =>
                            !organization.business_type_id &&
                            PermissionsService.hasPermission(organization, 'manage_organization')
                        );

                        if (organizations.length > 0) {
                            ModalService.open('businessSelect', {
                                organizations: organizations,
                                onReady: () => $state.go('organizations'),
                            });
                        } else {
                            $state.go('organizations');
                        }
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
        }, console.log);
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
                    title: 'popup_auth.labels.join',
                    description: 'popup_auth.notifications.link',
                    confirmBtnText: 'popup_auth.buttons.confirm',
                });

            }, (res) => {
                form.unlock();
                form.errors = res.data.errors;
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