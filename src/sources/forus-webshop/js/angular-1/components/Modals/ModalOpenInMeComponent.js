let ModalOpenInMeComponent = function(
    $filter,
    IdentityService,
    FormBuilderService,
    ModalService,
    SmsService
) {
    let $ctrl = this;

    $ctrl.sentSms = false;

    $ctrl.$onInit = () => {

        $ctrl.phoneForm = FormBuilderService.build({
            phone: "06"
        }, function(form) {
            form.lock();

            let phone = "+31" + form.values.phone.substr(1);
            let values = {
                phone: phone,
                title: $filter('i18n')('sign_up.sms.body')
            };

            SmsService.send(
                values
            ).then((res) => {
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

            IdentityService.authorizeAuthCode(
                form.values.auth_code
            ).then((res) => {

                $ctrl.close();

                ModalService.open('modalNotification', {
                    type: 'action-result',
                    title: $filter('i18n')('popup_auth.labels.join'),
                    description: $filter('i18n')('popup_auth.notifications.confirmation'),
                    confirmBtnText: $filter('i18n')('popup_auth.notifications.confirmation')
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
        '$filter',
        'IdentityService',
        'FormBuilderService',
        'ModalService',
        'SmsService',
        ModalOpenInMeComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-open-in-me.html';
    }
};