let EmailPreferencesComponent = function(
    $state,
    AuthService,
    ModalService,
    EmailPreferencesService,
    FormBuilderService
) {
    let $ctrl = this;

    $ctrl.loaded = false;

    let toggleSubscription = (email_unsubscribed = true) => {
        return EmailPreferencesService.update({
            email_unsubscribed: email_unsubscribed,
        }).then((res) => {
            $ctrl.email_unsubscribed = res.data.data.email_unsubscribed;
        });
    };

    $ctrl.buildForm = (preferences) => {
        $ctrl.form = FormBuilderService.build(preferences, (form) => {
            form.lock();

            EmailPreferencesService.update({
                email_unsubscribed: $ctrl.email_unsubscribed,
                preferences: form.values
            }).then(res => {
                form.unlock();
                ModalService.open('modalNotification', {
                    type: 'action-result',
                    description: `Succesvol e-mail voorkeuren geüpdate ${$ctrl.email}`,
                });
            }, (res) => {
                form.unlock();
                form.errors = res.data.errors;
            });
        });
    };

    $ctrl.enableSubscription = () => {
        return toggleSubscription(false);
    };

    $ctrl.disableSubscription = () => {
        return toggleSubscription(true);
    };

    $ctrl.$onInit = () => {
        if (AuthService.hasCredentials()) {
            return EmailPreferencesService.get().then(res => {
                $ctrl.email = res.data.data.email;
                $ctrl.preferences = res.data.data.preferences;
                $ctrl.email_unsubscribed = res.data.data.email_unsubscribed;
                $ctrl.loaded = true;
                
                $ctrl.buildForm($ctrl.preferences);
            })
        }

        ModalService.open('modalNotification', {
            type: 'action-result',
            title: "Authentification required.",
            description: `Please sign in to manage your notification preferences.`,
        });

        $state.go('home');
    };
}

module.exports = {
    controller: [
        '$state',
        'AuthService',
        'ModalService',
        'EmailPreferencesService',
        'FormBuilderService',
        EmailPreferencesComponent
    ],
    templateUrl: 'assets/tpl/pages/email-preferences.html'
};