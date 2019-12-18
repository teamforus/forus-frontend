module.exports = ['$transitions', '$filter', '$rootScope', 'OrganizationService', 'PageLoadingBarService', (
    $transitions, $filter, $rootScope, OrganizationService, PageLoadingBarService
) => {
    $transitions.onStart({}, function() {
        PageLoadingBarService.setProgress(0);
    });

    $transitions.onError({}, function() {
        PageLoadingBarService.setProgress(100);
    });

    $transitions.onSuccess({}, function(transition) {
        PageLoadingBarService.setProgress(100);

        let pageTitleKey = 'page_state_titles.' + transition.to().name;
        let pageTitleText = $filter('translate')(pageTitleKey);

        if (pageTitleKey == pageTitleText) {
            pageTitleText = $filter('translate')('page_title');
        }

        $rootScope.pageTitle = pageTitleText;

        document.body.scrollTop = document.documentElement.scrollTop = 0;

        if ([
                'home', 'organiztions', 'funds', 'funds-show',
                'organizations-create', 'csv-validation', 'validation-requests',
                'validation-request', 'sign-up', 'restore-email', 'email-unsubscribe',
                'email-preferences', 'provider-invitation-link', 'auth-link',
            ].indexOf(transition.to().name) == -1) {
            if (!OrganizationService.active()) {
                transition.router.stateService.transitionTo('organizations');
            }
        }

        return true;
    });
}];