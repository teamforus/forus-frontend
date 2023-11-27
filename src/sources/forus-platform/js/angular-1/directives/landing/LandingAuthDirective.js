const LandingAuthDirective = function(
    $scope,
    $state,
    $timeout,
    $rootScope,
    appConfigs,
    PermissionsService,
    IdentityService,
    FormBuilderService,
    CredentialsService,
    ModalService
) {
    let timeout;

    $scope.qrValue = null;
    $scope.emailSent = false;

    $scope.form = FormBuilderService.build({
        email: "",
    }, function(form) {
        IdentityService.makeAuthEmailToken(form.values.email).then(
            () => $scope.emailSent = true,
            (res) => {
                form.unlock();
                form.errors = res.data.errors ? res.data.errors : { email: [res.data.message] };
            });
    }, true);

    $scope.goToDashboard = () => {
        if (['provider'].indexOf(appConfigs.panel_type) != -1) {
            $rootScope.loadAuthUser().then(() => {
                $state.go('organizations');
            });
        } else {
            $rootScope.loadAuthUser().then(() => $state.go('organizations'));
        }
    }

    $scope.checkAccessTokenStatus = (type, access_token) => {
        IdentityService.checkAccessToken(access_token).then((res) => {
            if (res.data.message == 'active') {
                CredentialsService.set(access_token);
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
        }, console.error);
    };

    $scope.$watch(() => !!CredentialsService.get(), (value) => {
        $scope.showForm = !value || $scope.emailSent;

        if (value && !$scope.emailSent) {
            $scope.goToDashboard();
        }
    });
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
            '$rootScope',
            'appConfigs',
            'PermissionsService',
            'IdentityService',
            'FormBuilderService',
            'CredentialsService',
            'ModalService',
            LandingAuthDirective,
        ],
        templateUrl: 'assets/tpl/directives/landing/landing-auth.html'
    };
};