const Modal2FADeactivateComponent = function (
    $timeout,
    Identity2FAService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.resending = false;
    $ctrl.resendingBlocked = false;
    $ctrl.resendingInterval = 10000;

    $ctrl.blockResend = () => {
        $ctrl.resendingBlocked = true;

        $timeout(() => {
            $ctrl.resendingBlocked = false;
        }, $ctrl.resendingInterval)
    };

    $ctrl.resendCode = (notify = true) => {
        $ctrl.sendingCode = true;
        $ctrl.blockResend();

        Identity2FAService.send($ctrl.auth2fa.uuid).then(
            () => notify ? PushNotificationsService.success('Sent!', 'Your confirmation code was resent.') : null,
            (res) => PushNotificationsService.danger('Error!', res?.data?.message),
        ).then(() => $ctrl.sendingCode = false);
    };

    $ctrl.deactivateProvider = () => {
        Identity2FAService.deactivate($ctrl.auth2fa.uuid, {
            key: $ctrl.auth2fa.provider_type.key,
            code: $ctrl.confirmationCode,
        }).then(
            () => $ctrl.step = 'success',
            (res) => PushNotificationsService.danger(res.data?.message || 'Unknown error.'),
        );
    };

    $ctrl.cancel = () => {
        $ctrl.onCancel ? $ctrl.onCancel() : null;
        $ctrl.close();
    };

    $ctrl.done = () => {
        $ctrl.onReady();
        $ctrl.close();
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