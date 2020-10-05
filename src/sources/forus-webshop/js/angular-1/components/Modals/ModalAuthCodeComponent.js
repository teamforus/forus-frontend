let ModalAuthComponent = function(
    $filter,
    appConfigs,
    AuthService,
    IdentityService,
    FormBuilderService,
    ModalService
) {
    let $ctrl = this;
    let $trans = $filter('translate');

    $ctrl.$onInit = () => {
        if (AuthService.hasCredentials()) {
            return $ctrl.close();
        }

        $ctrl.signUpForm = FormBuilderService.build({
            email: "",
        }, function(form) {
            if (form.values.email != form.values.email_confirmation) {
                return form.errors = {
                    email_confirmation: [
                        $trans('popup_auth.validation.email_confirmation')
                    ]
                };
            }

            form.lock();

            IdentityService.validateEmail({
                email: form.values.email
            }).then(res => {
                let primary_email = form.values.email;

                if (!res.data.email.used) {
                    IdentityService.make({
                        email: primary_email
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
                        form.errors = res.data.errors;
                    });
                } else {
                    IdentityService.makeAuthEmailToken(primary_email, 'homeStart').then(() => {
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
                        form.errors = res.data.errors;
                    });
                }
            }, () => form.unlock());

            return;
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