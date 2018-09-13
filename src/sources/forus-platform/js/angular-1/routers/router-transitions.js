module.exports = function(
    $rootScope, 
    $transitions, 
    OrganizationService, 
    $state, 
    $trace
) {
    $transitions.onStart({}, (transition) => {
        // let organizationId = transition.params().organization_id;

        if ([
            'home', 'organiztions', 'funds', 'funds-show', 
            'organizations-create', 'csv-validation', 'validation-requests', 
            'validation-request', 'sign-up'
        ].indexOf(transition.to().name) == -1) {
            if (!OrganizationService.active()) {
                // $state.go('organizations');
                transition.router.stateService.transitionTo('organizations');
            }
        }

        /* if (!!organizationId && (organizationId != )) {
            OrganizationService.use(organizationId);
        } */

        return true;
    });
};