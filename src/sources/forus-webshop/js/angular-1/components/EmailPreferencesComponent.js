let EmailPreferencesComponent = function(
    $state,
    $timeout,
    AuthService,
    ModalService,
    EmailPreferencesService,
    PushNotificationsService
) {
    let $ctrl = this;
    let keysEditableOnWebshop = [
        'vouchers.payment_success', 
        'funds.fund_expires',
        'voucher.assigned',
        'voucher.transaction',
        'digest.daily_requester',
    ];

    $ctrl.loaded = false;

    let toggleSubscription = (email_unsubscribed = true) => {
        return EmailPreferencesService.update({
            email_unsubscribed: email_unsubscribed,
        }).then((res) => {
            $ctrl.email_unsubscribed = res.data.data.email_unsubscribed;
        });
    };

    $ctrl.simulateToggleClick = ($event, type, newValue) => {
        $event.stopPropagation();

        if (type.subscribed == newValue) {
            return;
        }

        $timeout(() => type.subscribed = !type.subscribed, 100);
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
        }).then(res => {
            PushNotificationsService.success('Opgeslagen!');
        });
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
        '$timeout',
        'AuthService',
        'ModalService',
        'EmailPreferencesService',
        'PushNotificationsService',
        EmailPreferencesComponent
    ],
    templateUrl: 'assets/tpl/pages/preferences/notification-preferences.html'
};