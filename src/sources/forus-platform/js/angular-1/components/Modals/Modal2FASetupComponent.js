const Modal2FASetupComponent = function (
    $timeout,
    Identity2FAService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.resending = false;
    $ctrl.resendingTime = 0;
    $ctrl.resendingInterval = 10;
    $ctrl.isLocked = false;

    $ctrl.lock = () => {
        if ($ctrl.isLocked) {
            return true;
        }

        $ctrl.isLocked = true;
    };

    $ctrl.unlock = (time = 1000) => {
        $timeout.cancel($ctrl.unlockEvent);
        $ctrl.unlockEvent = $timeout(() => $ctrl.isLocked = false, time);
    };

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
        }, (res) => {
            PushNotificationsService.danger(res.data?.message || 'Unknown error.');

            if (res.status == '429') {
                $ctrl.cancel();
            }
        });
    }

    $ctrl.setStep = (step) => {
        $ctrl.phoneNumber = '+31';
        $ctrl.phoneNumberError = null;
        $ctrl.confirmationCode = '';
        $ctrl.step = step;
    };

    $ctrl.submitPhoneNumber = () => {
        $ctrl.makePhone2FA();
    }

    $ctrl.submitAuthenticator = () => {
        $ctrl.setStep('provider_confirmation');
    }

    $ctrl.activateProvider = () => {
        if ($ctrl.lock()) {
            return;
        }

        Identity2FAService.activate($ctrl.auth_2fa.uuid, {
            key: $ctrl.provider.key,
            code: $ctrl.confirmationCode,
        }).then(
            () => {
                $ctrl.activateAuthErrors = null;
                $ctrl.setStep('success');
            },
            (res) => {
                $ctrl.activateAuthErrors = res.data?.errors?.code;
                PushNotificationsService.danger(res.data?.message || 'Unknown error.');
            },
        ).finally(() => $ctrl.unlock());
    };

    $ctrl.verifyAuthProvider = () => {
        if ($ctrl.lock()) {
            return;
        }

        Identity2FAService.authenticate($ctrl.auth_2fa.uuid, {
            code: $ctrl.confirmationCode,
        }).then(
            () => {
                $ctrl.verifyAuthErrors = null;
                $ctrl.setStep('success');
            },
            (res) => {
                $ctrl.verifyAuthErrors = res.data?.errors?.code;
                PushNotificationsService.danger(res.data?.message || 'Unknown error.');
            },
        ).finally(() => $ctrl.unlock());
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
        $ctrl.resendingTime = $ctrl.resendingInterval;

        const callback = () => {
            $ctrl.resendingTime--;

            if ($ctrl.resendingTime > 0) {
                $timeout(callback, 1000);
            }
        }

        $timeout(callback, 1000);
    };

    $ctrl.cancel = () => {
        $ctrl.onCancel ? $ctrl.onCancel() : null;
        $ctrl.close();
    };

    $ctrl.done = () => {
        $ctrl.onReady ? $ctrl.onReady() : null;
        $ctrl.close();
    };

    $ctrl.onKeyDown = (e) => {
        if (e.key === 'Enter' && $ctrl.step == 'provider_select') {
            return $ctrl.submitAuthenticator();
        }

        if (e.key === 'Enter' && $ctrl.step == 'success') {
            return $ctrl.done();
        }
    };

    $ctrl.bindEvents = () => {
        document.body.addEventListener("keydown", $ctrl.onKeyDown);
    };

    $ctrl.unbindEvents = () => {
        document.body.removeEventListener("keydown", $ctrl.onKeyDown);
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

        $ctrl.bindEvents();

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
        }
    };

    $ctrl.$onDestroy = () => {
        $ctrl.unbindEvents();
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