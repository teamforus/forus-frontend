let AuthPinCodeComponent = function(
    AuthService,
    IdentityService,
    CredentialsService
) {
    let $ctrl = this;

    $ctrl.state = false;
    $ctrl.pinCode = "";
    $ctrl.pinCodeError = false;

    $ctrl.STATE_PIN_CODE = 'pin_code';
    $ctrl.STATE_SUCCESS  = 'success';
    $ctrl.STATE_ERROR    = 'error';
    $ctrl.STATE_DETAILS  = 'details';

    $ctrl.submit = function(pinCode) {
        if (pinCode.length < 6) {
            return;
        }

        IdentityService.authorizeAuthCode(pinCode).then(res => {
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
        $ctrl.state = $ctrl.STATE_PIN_CODE;
    };

    $ctrl.goToDetailsPage = function() {
        $ctrl.state = $ctrl.STATE_DETAILS;
    }

    $ctrl.$onInit = function() {
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

        promise.then(res => {
            CredentialsService.set(res.data.access_token);
            $ctrl.initPinCode();
        }, () => {
            if (!AuthService.hasCredentials()) {
                return ($ctrl.state = $ctrl.STATE_ERROR);
            }

            return IdentityService.checkAccessToken(CredentialsService.get()).then(res => {
                if (res.data.message === 'active') {
                    return $ctrl.initPinCode();
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
    },
    controller: [
        'AuthService',
        'IdentityService',
        'CredentialsService',
        AuthPinCodeComponent
    ],
    template: require('../tpl/components/blocks/auth-pin_code-component.pug')()
};
