let ModalPinCodeComponent = function(
    IdentityService,
    FormBuilderService,
    appConfigs,
    ModalService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {

        $ctrl.authorizePincodeForm = FormBuilderService.build({
            auth_code: "",
        }, function(form) {
            form.lock();

            IdentityService.authorizeAuthCode(
                form.values.auth_code
            ).then((res) => {

                $ctrl.close();

                ModalService.open('modalNotification', {
                    type: 'confirm',
                    title: 'Log in op de app',
                    header: 'popup_auth.pin_code.confirmation.title_' + appConfigs.features.communication_type,
                    mdiIconType: 'success',
                    mdiIconClass: 'check-circle-outline',
                    description: 'popup_auth.pin_code.confirmation.description',
                    notice: 'popup_auth.pin_code.confirmation.notice_' + appConfigs.features.communication_type,
                    confirmBtnText: 'popup_auth.pin_code.confirmation.buttons.confirm',
                    cancelBtnText: 'popup_auth.pin_code.confirmation.buttons.try_again',
                    cancel: () => {
                        ModalService.open('modalPinCode', {});
                    }
                });

            }, (res) => {
                form.unlock();
                form.errors = res.data.errors;

                if (res.status == 404) {
                    form.errors = {
                        auth_code: ["Onbekende code."]
                    };
                }
            });
        });

        $ctrl.openInMeModal = () => {
            $ctrl.close();

            return ModalService.open('modalOpenInMe', {});
        };
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'IdentityService',
        'FormBuilderService',
        'appConfigs',
        'ModalService',
        ModalPinCodeComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-pin-code.html';
    }
};