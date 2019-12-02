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
            'bunq.transaction_success'
        ];
    }
    if (appConfigs.panel_type == 'provider'){
        keysEditableOnDashboard = [
            'funds.new_fund_started', 
            'funds.new_fund_applicable', 
            'funds.provider_approved', 
            'funds.provider_rejected', 
            'funds.product_reserved', 
            'funds.product_sold_out',
            'employee.created',
            'employee.deleted'
        ];
    }
    if (appConfigs.panel_type == 'validator'){
        keysEditableOnDashboard = [
            'validations.new_validation_request',
            'validations.you_added_as_validator'
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
            title: "Authentification required.",
            description: `U moet inloggen om uw e-mailvoorkeuren te kunnen instellen.`,
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
    templateUrl: 'assets/tpl/pages/email-preferences.html'
};