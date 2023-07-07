const Modal2FADeactivateComponent = function (
    $timeout,
    Identity2FAService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.resending = false;
    $ctrl.resendingTime = 0;
    $ctrl.resendingInterval = 10;

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

    $ctrl.resendCode = (notify = true) => {
        if ($ctrl.sendingCode) {
            return;
        }

        $ctrl.sendingCode = true;
        $ctrl.blockResend();

        Identity2FAService.send($ctrl.auth2fa.uuid).then(
            () => notify ? PushNotificationsService.success('Gelukt!', 'We hebben de code opnieuw verstuurd.') : null,
            (res) => PushNotificationsService.danger('Error!', res?.data?.message),
        ).finally(() => $timeout(() => $ctrl.sendingCode = false, 1000));
    };

    $ctrl.deactivateProvider = () => {
        if ($ctrl.deactivating) {
            return;
        }

        $ctrl.deactivating = true;

        Identity2FAService.deactivate($ctrl.auth2fa.uuid, {
            key: $ctrl.auth2fa.provider_type.key,
            code: $ctrl.confirmationCode,
        }).then(
            () => {
                $ctrl.step = 'success';
                $ctrl.errorCode = null;
            },
            (res) => {
                PushNotificationsService.danger(res.data?.message || 'Unknown error.');
                $ctrl.errorCode = res?.data?.errors?.code || null;
            },
        ).finally(() => $timeout(() => $ctrl.deactivating = false, 1000));
    };

    $ctrl.cancel = () => {
        $ctrl.onCancel ? $ctrl.onCancel() : null;
        $ctrl.close();
    };

    $ctrl.done = () => {
        $ctrl.onReady();
        $ctrl.close();
    };

    $ctrl.onKeyDown = (e) => {
        if (e.key === 'Enter' && $ctrl.step == 'success') {
            $ctrl.done();
        }
    };

    $ctrl.$onInit = () => {
        const { onReady, auth2fa } = $ctrl.modal.scope;

        $ctrl.step = 'confirmation';
        $ctrl.type = auth2fa.provider_type.type;
        $ctrl.auth2fa = auth2fa;
        $ctrl.onReady = onReady;

        if (auth2fa.provider_type.type == 'phone') {
            $ctrl.resendCode(false);
        }

        document.body.addEventListener("keydown", $ctrl.onKeyDown);
    };

    $ctrl.$onDestroy = () => {
        document.body.removeEventListener("keydown", $ctrl.onKeyDown);
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        '$timeout',
        'Identity2FAService',
        'PushNotificationsService',
        Modal2FADeactivateComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-2fa-deactivate.html',
};