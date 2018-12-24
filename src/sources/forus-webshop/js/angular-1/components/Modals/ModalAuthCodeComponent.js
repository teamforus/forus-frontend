let ModalAuthComponent = function(
    $filter,
    $rootScope,
    AuthService,
    IdentityService,
    FormBuilderService,
    CredentialsService,
    ModalService
) {

    let $ctrl = this;

    $ctrl.$onInit = () => {
        if (AuthService.hasCredentials()) {
            return $ctrl.close();
        }

        $ctrl.signUpForm = FormBuilderService.build({
            pin_code: "1111",
        }, function(form) {
            let records = form.values.records;

            if (records && (records.primary_email != records.primary_email_confirmation)) {
                return form.errors = {
                    'records.primary_email_confirmation': [
                        $filter('translate')('validation.email_confirmation')
                    ]
                };
            }

            form.lock();

            IdentityService.make({
                pin_code: form.values.pin_code,
                records: {
                    primary_email: records ? records.primary_email : ''
                },
            }).then((res) => {
                $ctrl.close();

                ModalService.open('modalNotification', {
                    type: 'info',
                    icon: 'email_confirmation',
                    title: 'Please check email.',
                    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
                });
            }, (res) => {
                form.unlock();
                form.errors = res.data.errors;
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
        '$rootScope',
        'AuthService',
        'IdentityService',
        'FormBuilderService',
        'CredentialsService',
        'ModalService',
        ModalAuthComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-auth-code.html';
    }
};