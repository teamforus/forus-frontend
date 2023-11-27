const ModalOpenInMeComponent = function(
    $filter,
    IdentityService,
    FormBuilderService,
    ModalService,
    appConfigs,
    ShareService
) {
    const $ctrl = this;

    $ctrl.sentSms = false;

    $ctrl.$onInit = () => {
        $ctrl.phoneForm = FormBuilderService.build({
            phone: "+31"
        }, function(form) {
            form.lock();

            ShareService.sendSms({
                phone: parseInt(form.values.phone.toString().replace(/\D/g, '') || 0),
                type: 'me_app_download_link'
            }).then((res) => {
                $ctrl.sentSms = true;
            }, (res) => {
                $ctrl.phoneForm.unlock();
                $ctrl.phoneForm.errors = res.data.errors;

                if (res.status == 429) {
                    $ctrl.phoneForm.errors = {
                        phone: [$filter('i18n')('sign_up.sms.error.try_later')]
                    };
                }
            });
        });

        $ctrl.authorizePincodeForm = FormBuilderService.build({
            auth_code: "",
        }, function(form) {
            form.lock();

            IdentityService.authorizeAuthCode(form.values.auth_code).then(() => {
                $ctrl.close();

                ModalService.open('modalNotification', {
                    type: 'confirm',
                    title: 'popup_auth.pin_code.confirmation.title_' + appConfigs.features.communication_type,
                    description: 'popup_auth.pin_code.confirmation.description',
                    cancelBtnText: 'popup_auth.pin_code.confirmation.buttons.try_again',
                    confirmBtnText: 'popup_auth.pin_code.confirmation.buttons.confirm'
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
    };

    $ctrl.skip = () => {
        $ctrl.sentSms = true;
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$filter',
        'IdentityService',
        'FormBuilderService',
        'ModalService',
        'appConfigs',
        'ShareService',
        ModalOpenInMeComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-open-in-me.html';
    }
};