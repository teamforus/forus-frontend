const FeaturesRedirectComponent = function ($state, $rootScope) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const organizationId = $rootScope.getLastUsedOrganization($ctrl.authUser.organizations);

        organizationId
            ? $state.go('features', { organization_id: organizationId })
            : $state.go('organizations');
    };
}

module.exports = {
    bindings: {
        authUser: '<'
    },
    controller: [
        '$state',
        '$rootScope',
        FeaturesRedirectComponent,
    ],
    templateUrl: 'assets/tpl/pages/feedback.html',
};