const snakeCase = require("lodash/snakeCase");
const FeatureRedirectComponent = function(
    $state,
    $rootScope,
    $stateParams,
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const organizationId = $rootScope.getLastUsedOrganization($ctrl.authUser.organizations);

        organizationId
            ? $state.go('features', { organization_id: organizationId, feature_key: $stateParams.feature_key })
            : $state.go('organizations-create');
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