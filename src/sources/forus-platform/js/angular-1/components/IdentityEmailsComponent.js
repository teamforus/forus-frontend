const IdentityEmailsComponent = function(
    $timeout,
    ModalService,
    FormBuilderService,
    IdentityEmailsService,
    PushNotificationsService
) {
    const $ctrl = this;
    const timeout = false;
    
    $ctrl.formSuccess = false;


    $ctrl.askConfirmation = (email, onConfirm) => {
        ModalService.open("dangerZone", {
            title: 'Confirmation',
            description: `Are you sure you want to remove this email "${email.email}"?`,
            cancelButton: `Cancel`,
            confirmButton: `Confirm`,
            text_align: 'center',
            onConfirm: onConfirm
        });
    };

    $ctrl.resendVerification = (email) => {
        if (email.disabled) {
            return false;
        }

        email.error = null;
        email.disabled = true;
        
        IdentityEmailsService.resendVerification(email.id).then(() => {
            PushNotificationsService.success('Verificatie e-mail opnieuw verstuurd!');
            timeout = $timeout(() => email.disabled = false, 1000);
        }, (res) => {
            if (res.status === 429) {
                email.error = res.data.message;
            }
        });
    };

    $ctrl.makePrimary = (email) => {
        if (email.disabled) {
            return false;
        }

        IdentityEmailsService.makePrimary(email.id).then(() => {
            PushNotificationsService.success('Opgeslagen!');
            $ctrl.loadIdentityEmails();
        });
    };

    $ctrl.deleteEmail = (email) => {
        if (email.disabled) {
            return false;
        }

        $ctrl.askConfirmation(email, () => {
            IdentityEmailsService.delete(email.id).then(() => {
                PushNotificationsService.success('Verwijderd!');
                $ctrl.loadIdentityEmails();
            });
        });
    };

    $ctrl.loadIdentityEmails = () => {
        IdentityEmailsService.list().then(res => {
            $ctrl.emails = res.data.data;
        });
    };

    $ctrl.makeEmailForm = () => {
        return FormBuilderService.build({
            email: ""
        }, (form) => {
            IdentityEmailsService.store(form.values.email).then((res) => {
                $ctrl.loadIdentityEmails();
                $ctrl.formSuccess = true;
                $ctrl.form = false;
            }, (res) => {
                if (res.status === 429) {
                    form.errors = {email: [res.data.message]};
                } else {
                    form.errors = res.data.errors;
                }

                form.unlock();
            });
        }, true);
    };

    $ctrl.createNewEmailForm = () => {
        $ctrl.formSuccess = false;
        $ctrl.form = $ctrl.makeEmailForm();
    };

    $ctrl.$onInit = () => {
        if (!$ctrl.auth2FAState?.restrictions?.emails?.restricted) {
            $ctrl.loadIdentityEmails()
        }
    };

    $ctrl.$onDestroy = () => {
        $timeout.cancel(timeout);
    };
}

module.exports = {
    bindings: {
        auth2FAState: '<',
    },
    controller: [
        '$timeout',
        'ModalService',
        'FormBuilderService',
        'IdentityEmailsService',
        'PushNotificationsService',
        IdentityEmailsComponent,
    ],
    templateUrl: 'assets/tpl/pages/preferences/emails.html',
};
