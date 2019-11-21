let EmailPreferencesComponent = function(
    $state,
    AuthService,
    ModalService,
    EmailPreferencesService,
    PushNotificationsService,
    FormBuilderService
) {
    let $ctrl = this;
    let keysEditableOnWebshop = [
        'vouchers.payment_success', 'funds.fund_expires'
    ];

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

    $ctrl.togglePreferenceOption = () => {
        EmailPreferencesService.update({
            email_unsubscribed: $ctrl.email_unsubscribed,
            preferences: $ctrl.form.values
        }).then(res => {
            $ctrl.form.unlock();
            
            PushNotificationsService.success('Opgeslagen!');
        }, (res) => {
            $ctrl.form.unlock();
            $ctrl.form.errors = res.data.errors;
        });
    }

    $ctrl.$onInit = () => {
        if (AuthService.hasCredentials()) {
            return EmailPreferencesService.get().then(res => {
                $ctrl.email = res.data.data.email;
                $ctrl.preferences = res.data.data.preferences.filter(preference => {
                    return keysEditableOnWebshop.indexOf(preference.key) != -1;
                });
                $ctrl.email_unsubscribed = res.data.data.email_unsubscribed;
                $ctrl.loaded = true;
                
                $ctrl.buildForm($ctrl.preferences);
            })
        }

        ModalService.open('modalNotification', {
            type: 'action-result',
            title: "U bent niet ingelogd.",
            description: `U zal moeten inloggen om uw notificatie instellingen te kunnen aanpassen.`,
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
        'PushNotificationsService',
        'FormBuilderService',
        EmailPreferencesComponent
    ],
    templateUrl: 'assets/tpl/pages/email-preferences.html'
};