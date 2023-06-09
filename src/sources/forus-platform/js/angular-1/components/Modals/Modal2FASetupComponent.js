const Modal2FASetupComponent = function (
    $timeout,
    Identity2FAService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.resending = false;
    $ctrl.resendingBlocked = false;
    $ctrl.resendingInterval = 10000;

    $ctrl.makePhone2FA = () => {
        return Identity2FAService.store({
            type: 'phone',
            phone: $ctrl.phoneNumber,
        }).then((res) => {
            $ctrl.setStep('provider_confirmation');
            $ctrl.auth_2fa = res.data?.data;
            $ctrl.blockResend();
        }, (res) => {
            $ctrl.phoneNumberError = res?.data?.errors?.phone;
            PushNotificationsService.danger(res.data?.message || 'Unknown error.');
        });
    }

    $ctrl.makeAuthenticator2FA = () => {
        return Identity2FAService.store({
            type: 'authenticator',
        }).then((res) => {
            $ctrl.setStep('provider_select');
            $ctrl.auth_2fa = res.data?.data;
        }, (res) => PushNotificationsService.danger(res.data?.message || 'Unknown error.'));
    }

    $ctrl.setStep = (step) => {
        if (step == 'phone_setup') {
            $ctrl.resetPhoneNumber();
        }

        $ctrl.step = step;
    };

    $ctrl.submitPhoneNumber = () => {
        $ctrl.makePhone2FA();
    }

    $ctrl.submitAuthenticator = () => {
        $ctrl.setStep('provider_confirmation');
    }

    $ctrl.resetPhoneNumber = () => {
        $ctrl.phoneNumber = '+31';
        $ctrl.phoneNumberError = null;
    };

    $ctrl.activateProvider = () => {
        Identity2FAService.activate($ctrl.auth_2fa.uuid, {
            key: $ctrl.provider.key,
            code: $ctrl.confirmationCode,
        }).then(
            () => $ctrl.setStep('success'),
            (res) => PushNotificationsService.danger(res.data?.message || 'Unknown error.'),
        );
    };

    $ctrl.verifyAuthProvider = () => {
        Identity2FAService.authenticate($ctrl.auth_2fa.uuid, {
            code: $ctrl.confirmationCode,
        }).then(
            () => $ctrl.setStep('success'),
            (res) => $ctrl.confirmationCodeError = res.data?.errors.code,
        );
    };

    $ctrl.resendCode = (notify = true) => {
        if ($ctrl.type == 'phone') {
            $ctrl.sendingCode = true;
            $ctrl.blockResend();

            Identity2FAService.send($ctrl.auth_2fa.uuid).then(
                () => notify ? PushNotificationsService.success('Sent!', 'Your confirmation code was resent.') : false,
                (res) => PushNotificationsService.danger('Error!', res?.data?.message),
            ).then(() => $ctrl.sendingCode = false);
        }
    };

    $ctrl.blockResend = () => {
        $ctrl.resendingBlocked = true;

        $timeout(() => {
            $ctrl.resendingBlocked = false;
        }, $ctrl.resendingInterval)
    };

    $ctrl.cancel = () => {
        $ctrl.onCancel ? $ctrl.onCancel() : null;
        $ctrl.close();
    };

    $ctrl.done = () => {
        $ctrl.onReady ? $ctrl.onReady() : null;
        $ctrl.close();
    };

    $ctrl.$onInit = () => {
        const { type, onReady, onCancel, auth, auth2FAState } = $ctrl.modal.scope;
        const { active_providers, providers } = auth2FAState;

        $ctrl.providers = providers.filter((provider) => provider.type == type);
        $ctrl.provider = $ctrl.providers.find((provider) => provider);
        
        $ctrl.active_providers = active_providers.filter((auth_2fa) => auth_2fa.provider_type.type == type);
        $ctrl.auth_2fa = $ctrl.active_providers.find((auth_2fa) => auth_2fa);
        
        $ctrl.auth = auth;
        $ctrl.type = type;

        $ctrl.onReady = onReady;
        $ctrl.onCancel = onCancel;

        // should authenticate
        if ($ctrl.auth) {
            if (type === 'phone') {
                $ctrl.resendCode(false);
            }

            return $ctrl.setStep('provider_verification');
        }

        // should setup
        if (type === 'authenticator') {
            $ctrl.makeAuthenticator2FA();
        }

        if (type === 'phone') {
            $ctrl.setStep('phone_setup');
            $ctrl.resetPhoneNumber();
        }
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$timeout',
        'Identity2FAService',
        'PushNotificationsService',
        Modal2FASetupComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-2fa-setup.html',
};