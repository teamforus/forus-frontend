let EmailPreferencesComponent =  function (
    $state,
    $scope,
    $stateParams,
    EmailPreferencesService,
    FormBuilderService
) {
    let $ctrl = this;

    EmailPreferencesService.getPreferences(
        $stateParams.identity_address,
        $stateParams.exchange_token
    ).then(response => {
        $ctrl.email = response.data.email;
        $ctrl.preferences = response.data.preferences;

        $ctrl.form = FormBuilderService.build(
            this.buildValues(response.data.preferences),
            function (form) {
                form.lock();

                EmailPreferencesService.updatePreferences(
                    $stateParams.identity_address,
                    $stateParams.exchange_token,
                    form.values
                ).then(response => {
                    if (response.data.success) {
                        $ctrl.message = `Succesvol e-mail voorkeuren geüpdate ${response.data.email}`;
                    }
                    else {
                        $ctrl.message = `Er is iets misgegaan, probeer het opnieuw`;
                    }
                }, response => {
                    if (response.status === 404) {
                        $ctrl.message = 'notification_preferences.errors.not_found';
                    }
                    else if (response.status === 403) {
                        $ctrl.message = 'notification_preferences.errors.not-pending';
                    }
                });
            }, (res) => {
                form.unlock();
                form.errors = res.data.errors;
            }
        );
    }, (response) => {
        if (response.status === 404) {
            $ctrl.message = 'notification_preferences.errors.not_found';
        }
    })

    this.buildValues = function (preferenceValues) {
        let values = {};

        for (let preference of preferenceValues) {
            values[preference.notification_type] = Boolean(preference.notification_preferences.length && preference.notification_preferences[0].subscribed);
        }

        return values;
    }
}

module.exports = {
    controller: [
        '$state',
        '$scope',
        '$stateParams',
        'EmailPreferencesService',
        'FormBuilderService',
        EmailPreferencesComponent
    ],
    templateUrl: 'assets/tpl/pages/email-preferences.html'
};
