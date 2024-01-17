const snakeCase = require("lodash/snakeCase");
const kebabCase = require("lodash/kebabCase");

const FeatureComponent = function (
    $stateParams,
    FeaturesService,
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.feature = FeaturesService.list.map((feature) => ({
            ...feature, enabled: $ctrl.features.statuses[feature.key] || false
        })).filter((feature) => feature.key === snakeCase($stateParams.feature_key))[0];

        $ctrl.additionalFeatures = $ctrl.feature ? FeaturesService.getAdditionalFeatures($ctrl.feature.key).map((feature) => ({
            ...feature,
            enabled: $ctrl.features.statuses[feature.key] || false,
            srefParams: { feature_key: kebabCase(feature.key), organization_id: $ctrl.organization.id },
        })) : [];
    }
};

module.exports = {
    bindings: {
        features: '<',
        organization: '<',
    },
    controller: [
        '$stateParams',
        'FeaturesService',
        FeatureComponent,
    ],
    templateUrl: ['$stateParams', 'FeaturesService', ($stateParams, FeaturesService) => {
        const feature = FeaturesService.list.find(
            (feature) => feature.key === snakeCase($stateParams.feature_key),
        );

        return `assets/tpl/pages/features/${feature ? `feature-${$stateParams.feature_key}` : 'not-found'}.html`;
    }]
};