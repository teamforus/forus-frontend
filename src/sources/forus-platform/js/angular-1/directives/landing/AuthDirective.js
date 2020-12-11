let AuthDirective = function(
    $scope,
    $state,
    $timeout,
    PermissionsService,
    IdentityService,
    FormBuilderService,
    ModalService
) {
    let timeout;

    $scope.qrValue = null;

    $scope.form = FormBuilderService.build({
        email: "",
    }, function(form) {
        form.lock();
        IdentityService.makeAuthEmailToken(form.values.email).then((res) => {
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
            form.errors = res.data.errors;
        });
    });

    $scope.checkAccessTokenStatus = (type, access_token) => {
        IdentityService.checkAccessToken(access_token).then((res) => {
            if (res.data.message == 'active') {
                CredentialsService.set(access_token);

                if (['provider'].indexOf(appConfigs.panel_type) != -1) {
                    $rootScope.loadAuthUser().then(auth_user => {
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
                    $rootScope.loadAuthUser().then(() => $state.go('organizations'));
                }
            } else if (res.data.message == 'pending') {
                timeout = $timeout(function() {
                    $scope.checkAccessTokenStatus(type, access_token);
                }, 2500);
            } else {
                document.location.reload();
            }
        });
    };

    $scope.showQrForm = function() {
        $scope.showQrCodeBlock = true;
        $scope.showChoose = false;

        $scope.requestAuthQrToken();
    };

    $scope.requestAuthQrToken = () => {
        IdentityService.makeAuthToken().then((res) => {
            $scope.authToken = res.data.auth_token;
            $scope.qrValue = $scope.authToken;

            $scope.checkAccessTokenStatus('token', res.data.access_token);
        }, console.log);
    };

    $scope.login = () => {
        $scope.form.submit();
    }

    $scope.register = () => {
        $state.go('sign-up');
    }

    $scope.$onInit = () => {};
};

module.exports = () => {
    return {
        scope: {
            text: '=',
            button: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            '$timeout',
            'PermissionsService',
            'IdentityService',
            'FormBuilderService',
            'ModalService',
            AuthDirective
        ],
        templateUrl: 'assets/tpl/directives/landing/auth.html' 
    };
};