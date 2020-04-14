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

        if ([
                'home', 'organiztions', 'funds', 'funds-show',
                'organizations-create', 'csv-validation', 'validation-requests',
                'validation-request', 'sign-up', 'sign-up-v2',
                'restore-email', 'email-unsubscribe',
                'preferences-notifications', 'security-sessions', 
                'provider-invitation-link', 'auth-link', 'identity-emails',
            ].indexOf(transition.to().name) == -1) {
            if (!OrganizationService.active()) {
                transition.router.stateService.transitionTo('organizations');
            }
        }

        return true;
    });
}];