const EmailPreferencesComponent = function(
    $state,
    AuthService,
    ModalService,
    EmailPreferencesService,
    PushNotificationsService
) {
    const $ctrl = this;
    const keysEditableOnWebshop = [
        'vouchers.payment_success', 
        'funds.fund_expires',
        'voucher.assigned',
        'voucher.transaction',
        'digest.daily_requester',
    ];

    const toggleSubscription = (email_unsubscribed = true) => {
        return EmailPreferencesService.update({
            email_unsubscribed: email_unsubscribed,
        }).then((res) => {
            $ctrl.email_unsubscribed = res.data.data.email_unsubscribed;
        });
    };


    $ctrl.loaded = false;

    $ctrl.togglePreference = ($event, option) => {
        if ($event?.key == 'Enter') {
            option.subscribed = !option.subscribed;
            $ctrl.togglePreferenceOption();
        }
    }

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
        }).then(() => PushNotificationsService.success('Opgeslagen!'));
    }

    $ctrl.$onInit = () => {
        if (AuthService.hasCredentials()) {
            return EmailPreferencesService.get().then(res => {
                $ctrl.email = res.data.data.email;
                $ctrl.emailPreferences = res.data.data.preferences.filter(preference => {
                    return keysEditableOnWebshop.indexOf(preference.key) != -1 && preference.type == 'email';
                });

                $ctrl.pushPreferences = res.data.data.preferences.filter(preference => {
                    return keysEditableOnWebshop.indexOf(preference.key) != -1 && preference.type == 'push';
                });

                $ctrl.preferences = $ctrl.emailPreferences.concat($ctrl.pushPreferences);

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
    templateUrl: 'assets/tpl/pages/preferences/notification-preferences.html'
};