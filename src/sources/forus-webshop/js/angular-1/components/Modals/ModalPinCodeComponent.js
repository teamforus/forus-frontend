let ModalPinCodeComponent = function(
    IdentityService,
    FormBuilderService,
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
                    title: 'popup_auth.pin_code.confirmation.title',
                    description: 'popup_auth.pin_code.confirmation.description',
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
                        auth_code: ["Unknown code."]
                    };
                }
            });
        });
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
        'ModalService',
        ModalPinCodeComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-pin-code.html';
    }
};