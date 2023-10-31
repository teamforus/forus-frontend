const snakeCase = require("lodash/snakeCase");

const FeatureComponent = function (
    $stateParams,
    FeaturesService,
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.feature = FeaturesService.list.map((feature) => ({
            ...feature, enabled: $ctrl.features.statuses[feature.key] || false
        })).filter((feature) => feature.key === snakeCase($stateParams.feature_key))[0];
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
    templateUrl: function ($stateParams, FeaturesService) {
        const feature = FeaturesService.list.find(
            (feature) => feature.key === snakeCase($stateParams.feature_key),
        );

        return `assets/tpl/pages/features/${feature ? `feature-${$stateParams.feature_key}` : 'not-found'}.html`;
    }
};