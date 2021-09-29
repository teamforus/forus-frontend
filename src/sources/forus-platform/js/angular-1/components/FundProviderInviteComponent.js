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
    ModalService,
    HelperService
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
            PushNotificationsService.danger(res.data.message);
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
            PushNotificationsService.danger(res.data.message);
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
        }, console.error);
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
            email: "",
        }, (form) => {
            IdentityService.makeAuthEmailToken(form.values.email).then(() => {
                $ctrl.screen = 'sign_in-email-sent';

                let emailServiceUrl = HelperService.getEmailServiceProviderUrl(form.values.email);

                ModalService.open('modalNotification', {
                    type: 'action-result',
                    class: 'modal-description-pad modal-content',
                    title: 'popup_auth.labels.join',
                    description: 'popup_auth.notifications.link',
                    confirmBtnText: emailServiceUrl ? 'email_service_switch.confirm' : 'popup_auth.buttons.confirm',
                    confirm: () => HelperService.openInNewTab(emailServiceUrl)
                });

                $ctrl.showAuth = false;
                $timeout.cancel(timeout);
            }, (res) => {
                form.unlock();
                form.errors = res.data.errors;
            });
        }, true);

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
        'ModalService',
        'HelperService',
        FundProviderInviteComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-provider-invite.html'
};