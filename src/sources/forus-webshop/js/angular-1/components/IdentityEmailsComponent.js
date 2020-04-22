let IdentityEmailsComponent = function(
    $timeout,
    FormBuilderService,
    IdentityEmailsService,
    PushNotificationsService
) {
    let $ctrl = this;
    let timeout = false;
    
    $ctrl.formSuccess = false;

    $ctrl.resendVerification = (email) => {
        if (email.disabled) {
            return false;
        }
        
        IdentityEmailsService.resendVerification(email.id).then(() => {
            PushNotificationsService.success('Verificatie email opnieuw verstuurd!');
            email.disabled = true;
            timeout = $timeout(() => email.disabled = false, 1000);
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
            $ctrl.loaded = true;
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
                form.errors = res.data.errors;
                form.unlock();
            });
        }, true);
    };

    $ctrl.createNewEmailForm = () => {
        $ctrl.formSuccess = false;
        $ctrl.form = $ctrl.makeEmailForm();
    };

    $ctrl.$onInit = () => {
        $ctrl.loadIdentityEmails();
    };

    $ctrl.$onDestroy = () => {
        $timeout.cancel(timeout);
    };
}

module.exports = {
    controller: [
        '$timeout',
        'FormBuilderService',
        'IdentityEmailsService',
        'PushNotificationsService',
        IdentityEmailsComponent
    ],
    templateUrl: 'assets/tpl/pages/preferences/emails.html'
};
