let ModalAuthComponent = function(
    $filter,
    appConfigs,
    AuthService,
    IdentityService,
    FormBuilderService,
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
                    icon: 'email',
                    title: 'Stap 2 van 3: Bevestig dat u toegang heeft tot dit e-mailadres.',
                    description: 'U heeft een e-mail ontvangen op het e-mailadres dat u zojuist hebt ingevuld. Ga naar uw inbox en open de e-mail met het onderwerp "E-mail activering" en klik in de e-mail op de blauwe knop.',
                });
            }, (res) => {
                form.unlock();

                if(res.data.errors['records.primary_email'] && res.data.errors['records.primary_email'].length){
                    // if email is already registered (it can be registered or invalid if there are errors in primary_email) -
                    // try to login this email
                    let source = appConfigs.client_key + '_webshop';

                    IdentityService.makeAuthEmailToken(
                        source,
                        records ? records.primary_email : '',
                        'homeStart'
                    ).then((res) => {
                        localStorage.setItem('pending_email_token', res.data.access_token);
                        $ctrl.close();

                        ModalService.open('modalNotification', {
                            type: 'action-result',
                            class: 'modal-description-pad',
                            title: 'popup_auth.labels.join',
                            description: 'popup_auth.notifications.link',
                            confirmBtnText: 'popup_auth.buttons.submit'
                        });

                    }, (res) => {
                        form.unlock();

                        if(res.data.errors['primary_email'] && res.data.errors['primary_email'].length){
                            form.errors['records.primary_email'] = res.data.errors['primary_email'];
                        }
                    });

                }else{
                    form.errors = res.data.errors;
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
        'appConfigs',
        'AuthService',
        'IdentityService',
        'FormBuilderService',
        'ModalService',
        ModalAuthComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-auth-code.html';
    }
};
