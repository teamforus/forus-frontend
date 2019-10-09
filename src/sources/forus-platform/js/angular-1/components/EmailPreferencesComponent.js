let EmailPreferencesComponent = function(
    $state,
    AuthService,
    ModalService,
    EmailPreferencesService,
    FormBuilderService
) {
    let $ctrl = this;

    $ctrl.loaded = false;
    if(appConfigs.panel_type == 'sponsor'){
        let keysEditableOnDashboard = [
            'funds.provider_applied', 'funds.balance_warning', 'funds.product_added'
        ];
    }
    if (appConfigs.panel_type == 'sponsor'){
        let keysEditableOnDashboard = [
            'funds.new_fund_started', 'funds.new_fund_applicable', 'funds.provider_approved', 'funds.provider_rejected', 'funds.product_reserved', 'funds.product_sold_out'
        ];
    }
    if (appConfigs.panel_type == 'validator'){
        let keysEditableOnDashboard = [
            'validations.new_validation_request','validations.you_added_as_validator'
        ];
    }

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
                $ctrl.preferences = res.data.data.preferences.filter(preference => {
                    return keysEditableOnDashboard.indexOf(preference.key) != -1;
                });
                $ctrl.email_unsubscribed = res.data.data.email_unsubscribed;
                $ctrl.loaded = true;
                
                $ctrl.buildForm($ctrl.preferences);
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
        'FormBuilderService',
        EmailPreferencesComponent
    ],
    templateUrl: 'assets/tpl/pages/email-preferences.html'
};