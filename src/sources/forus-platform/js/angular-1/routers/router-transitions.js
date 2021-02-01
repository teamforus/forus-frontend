module.exports = ['$transitions', '$rootScope', 'OrganizationService', 'PageLoadingBarService', (
    $transitions, $rootScope, OrganizationService, PageLoadingBarService
) => {
    $transitions.onStart({}, function() {
        PageLoadingBarService.setProgress(0);
    });

    $transitions.onError({}, function() {
        PageLoadingBarService.setProgress(100);
    });

    $transitions.onSuccess({}, function(transition) {
        PageLoadingBarService.setProgress(100);

        if (typeof $rootScope.onPageChanged == 'function') {
            $rootScope.onPageChanged(transition);
        }

        if (![
            'home', 'organiztions', 'funds', 'funds-show',
            'organizations-create', 'csv-validation', 'validation-requests',
            'validation-request', 'sign-up',
            'restore-email', 'email-unsubscribe',
            'preferences-notifications', 'security-sessions',
            'provider-invitation-link', 'auth-link', 'identity-emails',
            'confirmation-email', 'organizations',
        ].includes(transition.to().name)) {
            if (!OrganizationService.active()) {
                transition.router.stateService.transitionTo('organizations');
            }
        }

        return true;
    });
}];