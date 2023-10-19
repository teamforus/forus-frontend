const kebabCase = require("lodash/kebabCase");

const FeaturesComponent = function (
    $state,
    $scope,
    FeaturesService,
) {
    const $ctrl = this;

    $ctrl.filters = {
        q: '',
        state: 'all',
    };

    const filterFeatures = (value) => {
        const q = value.q.toLowerCase();

        const list = $ctrl.allFeatures
            .filter((item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q))
            .filter((item) => (value.state === 'all' || (value.state === 'active' ? item.enabled : !item.enabled)));

        $ctrl.features = list.slice(0, 4);
        $ctrl.featuresAfter = list.slice(4);
    }

    const setActiveCounts = () => {
        const active = $ctrl.allFeatures.filter(feature => feature.enabled).length;
        const notActive = $ctrl.allFeatures.filter(feature => !feature.enabled).length;

        $ctrl.active_options = [{
            value: 'all',
            name: 'All',
        }, {
            value: 'active',
            name: `Actief (${active})`,
        }, {
            value: 'available',
            name: `Niet Actief (${notActive})`,
        }];
    }

    $ctrl.$onInit = () => {
        $ctrl.previewList = FeaturesService.previewList;
        $ctrl.allFeatures = FeaturesService.list.map((feature) => ({
            ...feature,
            enabled: $ctrl.features.statuses[feature.key] || false,
            srefParams: { feature_key: kebabCase(feature.key), organization_id: $ctrl.organization.id },
        }));

        setActiveCounts();
        filterFeatures($ctrl.filters);

        $scope.$watch('$ctrl.filters', filterFeatures, true);
    }
};

module.exports = {
    bindings: {
        features: '<',
        organization: '<',
    },
    controller: [
        '$state',
        '$scope',
        'FeaturesService',
        FeaturesComponent,
    ],
    templateUrl: 'assets/tpl/pages/features.html',
};