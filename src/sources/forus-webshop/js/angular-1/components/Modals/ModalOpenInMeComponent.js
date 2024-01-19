const ModalOpenInMeComponent = function(
    $filter,
    FormBuilderService,
    ModalService,
    ShareService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.phoneForm = FormBuilderService.build({
            phone: "+31"
        }, function(form) {
            form.lock();

            ShareService.sendSms({
                phone: parseInt(form.values.phone.toString().replace(/\D/g, '') || 0),
                type: 'me_app_download_link'
            }).then((res) => {
                $ctrl.close();
                ModalService.open('modalPinCode');
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
    };

    $ctrl.skip = () => {
        ModalService.open('modalPinCode');
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$filter',
        'FormBuilderService',
        'ModalService',
        'ShareService',
        ModalOpenInMeComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-open-in-me.html';
    }
};