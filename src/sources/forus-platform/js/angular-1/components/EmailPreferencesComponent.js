let EmailPreferencesComponent = function(
    $state,
    AuthService,
    ModalService,
    EmailPreferencesService,
    PushNotificationsService,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.loaded = false;
    let keysEditableOnDashboard;

    if(appConfigs.panel_type == 'sponsor'){
        keysEditableOnDashboard = [
            'funds.provider_applied', 
            'funds.balance_warning', 
            'funds.product_added',
            'employee.created',
            'employee.deleted',
            'digest.daily_sponsor',
            'digest.daily_validator',
        ];
    } else if (appConfigs.panel_type == 'provider'){
        keysEditableOnDashboard = [
            'funds.new_fund_started', 
            'funds.new_fund_applicable', 
            'funds.provider_approved', 
            'funds.provider_rejected', 
            'funds.product_reserved', 
            'funds.product_sold_out',
            'bunq.transaction_success',
            'employee.created',
            'employee.deleted',
            'digest.daily_provider_funds',
            'digest.daily_provider_products',
        ];
    } else if (appConfigs.panel_type == 'validator'){
        keysEditableOnDashboard = [
            'validations.new_validation_request',
            'validations.you_added_as_validator',
            'employee.created',
            'employee.deleted',
            'digest.daily_validator',
            'funds_requests.assigned_by_supervisor',
        ];
    }

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

                $ctrl.emailPreferences = res.data.data.preferences.filter(preference => {
                    return keysEditableOnDashboard.indexOf(preference.key) != -1 && preference.type == 'email';
                });

                $ctrl.pushPreferences = res.data.data.preferences.filter(preference => {
                    return keysEditableOnDashboard.indexOf(preference.key) != -1 && preference.type == 'push';
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
        'appConfigs',
        EmailPreferencesComponent
    ],
    templateUrl: 'assets/tpl/pages/preferences/notifications.html'
};