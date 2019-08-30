const EmailUnsubscribeComponent =  function (
    $state,
    $scope,
    $stateParams,
    EmailPreferencesService
) {
    let $ctrl = this;

    $ctrl.unsubscribe = () => {
        EmailPreferencesService.unsubscribe(
            $stateParams.identity_address,
            $stateParams.exchange_token
        ).then(response => {
            if (response.data.success) {
                $ctrl.message = `Succesvol alle melding afgemeld voor e-mail ${response.data.email}`;
            }
            else {
                $ctrl.message = `Er is iets misgegaan, probeer het opnieuw`;
            }
        }, (response) => {
            if (response.status === 404) {
                $ctrl.message = 'notification_preferences.errors.not_found';
            }
            else if (response.status === 403) {
                $ctrl.message = 'notification_preferences.errors.not-pending';
            }
        })
    }
}

module.exports = {
    controller: [
        '$state',
        '$scope',
        '$stateParams',
        'EmailPreferencesService',
        EmailUnsubscribeComponent
    ],
    templateUrl: 'assets/tpl/pages/email-unsubscribe.html'
};
