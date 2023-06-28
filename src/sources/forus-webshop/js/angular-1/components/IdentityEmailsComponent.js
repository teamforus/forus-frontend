const IdentityEmailsComponent = function(
    $timeout,
    FormBuilderService,
    IdentityEmailsService,
    PushNotificationsService
) {
    const $ctrl = this;
    let timeout = false;
    
    $ctrl.formSuccess = false;

    $ctrl.resendVerification = (email) => {
        if (email.disabled) {
            return false;
        }

        delete email.error;
        
        IdentityEmailsService.resendVerification(email.id).then(() => {
            PushNotificationsService.success('Verificatie e-mail opnieuw verstuurd!');
            email.disabled = true;
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

        IdentityEmailsService.delete(email.id).then(() => {
            PushNotificationsService.success('Verwijderd!');
            $ctrl.loadIdentityEmails();
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
        'FormBuilderService',
        'IdentityEmailsService',
        'PushNotificationsService',
        IdentityEmailsComponent,
    ],
    templateUrl: 'assets/tpl/pages/preferences/emails.html',
};
