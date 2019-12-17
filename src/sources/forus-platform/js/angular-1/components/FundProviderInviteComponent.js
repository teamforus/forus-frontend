let FundProviderInviteComponent = function(
    $state,
    $stateParams,
    $timeout,
    AuthService,
    IdentityService,
    FormBuilderService,
    PushNotificationsService,
    FundProviderInvitationsService,
    OrganizationService,
    appConfigs,
) {
    let $ctrl = this;
    let timeout;
    
    $ctrl.invitation;
    $ctrl.isAuthorized = AuthService.hasCredentials();

    $ctrl.showAuth = false;
    $ctrl.qrValue = null;
    $ctrl.showChoose = true;
    $ctrl.showQrCodeBlock = false;
    $ctrl.showEmailBlock = false;

    $ctrl.$onInit = function() {
        if (!$stateParams.token) {
            return $state.go('home');
        }

        if (AuthService.hasCredentials()) {
            IdentityService.identity().then(() => {
                $ctrl.isAuthorized = true;
            }, () => {});
        }

        $ctrl.loadInvitation($stateParams.token);
    };

    $ctrl.loadInvitation = (token) => {
        FundProviderInvitationsService.readInvitation(token).then(res => {
            $ctrl.invitation = res.data.data;

            if ($ctrl.invitation.state != 'pending') {
                $ctrl.initAuthBlock();
                $ctrl.showAuth = true;
            }
        }, res => {
            PushNotificationsService.error(res.data.message);
        });
    };

    $ctrl.acceptInvitation = (token) => {
        FundProviderInvitationsService.acceptInvitation(
            $stateParams.token
        ).then(res => {
            $ctrl.invitation = res.data.data;

            if ($ctrl.invitation.state != 'pending') {
                $ctrl.initAuthBlock();
                $ctrl.showAuth = true;
            }
        }, res => {
            PushNotificationsService.error(res.data.message);
        });
    };

    $ctrl.initAuthBlock = () => {
        if (!$ctrl.isAuthorized) {
            $ctrl.requestAuthQrToken();
            $ctrl.showEmailForm();
        }
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

    $ctrl.goToOfficePage = () => {
        OrganizationService.use($ctrl.invitation.provider_organization.id);

        $state.go('offices', {
            organization_id: $ctrl.invitation.provider_organization.id
        });
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
                    title: 'popup_auth.labels.join',
                    description: 'popup_auth.notifications.link',
                    confirmBtnText: 'popup_auth.buttons.confirm',
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
    controller: [
        '$state',
        '$stateParams',
        '$timeout',
        'AuthService',
        'IdentityService',
        'FormBuilderService',
        'PushNotificationsService',
        'FundProviderInvitationsService',
        'OrganizationService',
        'appConfigs',
        FundProviderInviteComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-provider-invite.html'
};