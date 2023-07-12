const Auth2FAComponent = function (
    $timeout,
    AuthService,
    ModalService,
    IdentityService,
    CredentialsService,
    Identity2FAService,
) {
    const $ctrl = this;

    $ctrl.state = false;
    $ctrl.pinCode = "";
    $ctrl.pinCodeError = false;
    $ctrl.showMissingText = false;

    $ctrl.STATE_APP      = 'app';
    $ctrl.STATE_PIN_CODE = 'pin_code';
    $ctrl.STATE_SUCCESS  = 'success';
    $ctrl.STATE_ERROR    = 'error';
    $ctrl.STATE_DETAILS  = 'details';
    $ctrl.STATE_AUTH_2FA = 'auth_2fa';

    $ctrl.goDashboard = () => {
        return document.location.reload();
    };

    $ctrl.auth2FA = (type, auth = false) => {
        $ctrl.hidePane = true;

        ModalService.open('2FASetup', {
            ...{ auth, type },
            auth2FAState: $ctrl.auth2FAState,
            onCancel: () => $ctrl.hidePane = false,
            onReady: () => $ctrl.goDashboard(),
        });
    };

    $ctrl.submit = function(pinCode) {
        if (pinCode.length < 6) {
            return;
        }

        IdentityService.authorizeAuthCode(pinCode, true).then(res => {
            $ctrl.state = $ctrl.STATE_SUCCESS;
            IdentityService.deleteToken();
        }, err => {
            if (err.status !== 403) {
                return ($ctrl.pinCodeError = err.data.message);
            }

            $ctrl.state = $ctrl.STATE_ERROR;
        });
    };

    $ctrl.initPinCode = function() {
        if ($ctrl.mobile) {
            return IdentityService.storeShared2FA().then((res) => {
                $ctrl.state = $ctrl.STATE_APP;
                $ctrl.redirectUrl = res.data.redirect_url;

                $timeout(() => $ctrl.showMissingText = true, 2500);
    
                return $timeout(() => {
                    document.querySelector('.block-missing-app .button').click();
                }, 100);
            });
        }

        $ctrl.state = $ctrl.STATE_PIN_CODE;
    };

    $ctrl.goToDetailsPage = function() {
        $ctrl.state = $ctrl.STATE_DETAILS;
    }

    $ctrl.onReady = () => {
        Identity2FAService.status().then((res) => {
            $ctrl.auth2FAState = res.data.data;

            const { required, confirmed, active_providers, provider_types } = $ctrl.auth2FAState;

            $ctrl.hidePane = false;
            $ctrl.provider_types = provider_types;
            $ctrl.active_providers = active_providers;

            if (!required || confirmed) {
                return $ctrl.initPinCode();
            }

            $ctrl.state = $ctrl.STATE_AUTH_2FA;

            if (active_providers.length == 0) {
                $ctrl.step = 'setup';
                $ctrl.provider_types = provider_types;
            }

            if (active_providers.length > 0) {
                $ctrl.step = 'auth';
                $ctrl.provider_types = provider_types.filter((provider_type) => {
                    return active_providers.map((auth_2fa) => auth_2fa.provider_type.type).includes(provider_type.type);
                });
            }
        }, () => {
            return ($ctrl.state = $ctrl.STATE_ERROR); 
        });
    };

    $ctrl.$onInit = () => {
        let promise = null;

        if (!$ctrl.type || !$ctrl.token) {
            return ($ctrl.state = $ctrl.STATE_ERROR);
        }

        if ($ctrl.type === 'email_sign_in') {
            promise = IdentityService.authorizeAuthEmailToken($ctrl.token);
        } else if ($ctrl.type === 'email_confirmation') {
            promise = IdentityService.exchangeConfirmationToken($ctrl.token);
        } else {
            return ($ctrl.state = $ctrl.STATE_ERROR);
        }

        promise.then((res) => {
            CredentialsService.set(res.data.access_token);
            return $ctrl.onReady();
        }, () => {
            if (!AuthService.hasCredentials()) {
                return ($ctrl.state = $ctrl.STATE_ERROR);
            }

            return IdentityService.checkAccessToken(CredentialsService.get()).then(res => {
                if (res.data.message === 'active') {
                    return $ctrl.onReady();
                }

                return ($ctrl.state = $ctrl.STATE_ERROR);
            });
        });
    };
};

module.exports = {
    bindings: {
        type: '@',
        token: '@',
        mobile: '=',
    },
    controller: [
        '$timeout',
        'AuthService',
        'ModalService',
        'IdentityService',
        'CredentialsService',
        'Identity2FAService',
        Auth2FAComponent,
    ],
    template: require('../tpl/components/blocks/auth-2fa.pug')(),
};
