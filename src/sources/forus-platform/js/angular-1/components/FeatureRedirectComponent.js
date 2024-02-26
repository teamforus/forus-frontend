const FeatureRedirectComponent = function ($state, $rootScope, $stateParams) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const organizationId = $rootScope.getLastUsedOrganization($ctrl.authUser.organizations);
        const featureKey = $stateParams.feature_key;

        organizationId
            ? $state.go('feature', { organization_id: organizationId, feature_key: featureKey })
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
        '$stateParams',
        FeatureRedirectComponent,
    ],
    templateUrl: 'assets/tpl/pages/feedback.html',
};