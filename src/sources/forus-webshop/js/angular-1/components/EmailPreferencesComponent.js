let EmailPreferencesComponent = function(
    $state,
    AuthService,
    ModalService,
    EmailPreferencesService,
    PushNotificationsService
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

    $ctrl.enableSubscription = () => {
        return toggleSubscription(false);
    };

    $ctrl.disableSubscription = () => {
        return toggleSubscription(true);
    };

    $ctrl.togglePreferenceOption = () => {
        EmailPreferencesService.update({
            email_unsubscribed: $ctrl.email_unsubscribed,
            preferences: $ctrl.preferences
        }).then(res => {
            PushNotificationsService.success('Opgeslagen!');
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
        EmailPreferencesComponent
    ],
    templateUrl: 'assets/tpl/pages/email-preferences.html'
};