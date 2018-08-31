let PopupAuthDirective = function(
    $state,
    $scope,
    $timeout,
    $rootScope,
    AuthService,
    IdentityService,
    FormBuilderService,
    PrevalidationService,
    CredentialsService
) {
    $scope.$watch('popup.screen', function(newValue) {
        if (newValue == 'sign_in-qr') {
            $ctrl.requestAuthToken();
        } else if (newValue == 'activate-code') {
            $scope.activateCodeForm = FormBuilderService.build({
                code: "",
            }, function(form) {
                if (!form.values.code) {
                    form.errors.code = true;
                    return;
                }
                
                form.lock();

                PrevalidationService.redeem(form.values.code).then((res) => {
                    $state.go('records');
                    $scope.popup.close();
                }, (res) => {
                    form.errors.code = true
                    form.unlock();
                });
            });
        } else if (newValue == 'sign_up-code') {
            $scope.signUpForm = FormBuilderService.build({
                code: "",
                pin_code: "1111",
            }, function(form) {
                form.lock();

                IdentityService.make(form.values).then((res) => {
                    $ctrl.applyAccessToken(res.data.access_token);

                    PrevalidationService.redeem(
                        form.values.code
                    ).then(function() {
                        console.log("It's done!");
                    }, console.error);
                }, (res) => {
                    form.unlock();
                    form.errors = res.data.errors;
                });
            });
        }
    });

    let $ctrl = this;
    let qrCodeEl;

    this.$onInit = function() {
        qrCodeEl = document.getElementById('auth_qrcode');
    }

    if (AuthService.hasCredentials()) {
        $scope.popup.close();
    }

    $ctrl.showModal = false;

    $ctrl.applyAccessToken = function(access_token) {
        CredentialsService.set(access_token);
        $rootScope.loadAuthUser();
        $scope.popup.close();
    };

    $ctrl.checkAccessTokenStatus = (type, access_token) => {
        IdentityService.checkAccessToken(access_token).then((res) => {
            if (res.data.message == 'active') {
                $ctrl.applyAccessToken(access_token);
            } else if (res.data.message == 'pending') {
                $timeout(function() {
                    $ctrl.checkAccessTokenStatus(type, access_token);
                }, 2500);
            } else {
                document.location.reload();
            }
        });
    };

    $ctrl.requestAuthToken = () => {
        IdentityService.makeAuthToken().then((res) => {
            $ctrl.authToken = res.data.auth_token;

            new QRCode(qrCodeEl, {
                text: JSON.stringify({
                    type: 'auth_token',
                    'value': $ctrl.authToken
                })
            });

            qrCodeEl.removeAttribute('title');

            $ctrl.showModal = true;

            $ctrl.checkAccessTokenStatus('token', res.data.access_token);
        }, console.log);
    };

    $ctrl.closeModal = function() {
        $ctrl.showModal = false;
        qrCodeEl.innerHTML = '';
    };
};

module.exports = () => {
    return {
        scope: {
            popup: '='
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$state',
            '$scope',
            '$timeout',
            '$rootScope',
            'AuthService',
            'IdentityService',
            'FormBuilderService',
            'PrevalidationService',
            'CredentialsService',
            PopupAuthDirective
        ],
        templateUrl: 'assets/tpl/directives/popup-auth.html' 
    };
};