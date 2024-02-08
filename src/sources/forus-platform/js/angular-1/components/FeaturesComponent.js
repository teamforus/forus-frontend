const kebabCase = require("lodash/kebabCase");

const FeaturesComponent = function (
    $state,
    $scope,
    ModalService,
    FeaturesService,
) {
    const $ctrl = this;

    $ctrl.filters = {
        q: '',
        state: 'all',
    };

    const filterByName = (item, q) => item.name.toLowerCase().includes(q);
    const filterByDescription = (item, q) => item.description.toLowerCase().includes(q);

    const filterByLabel = (item, q) => item.labels.filter((label) => label.toLowerCase().includes(q)).length;
    const filterByState = (item, state) => state === 'all' || (state === 'active' ? item.enabled : !item.enabled);

    const filterFeatures = (value) => {
        const q = value.q.toLowerCase();

        const list = $ctrl.allFeatures
            .filter((item) => filterByName(item, q) || filterByDescription(item, q) || filterByLabel(item, q))
            .filter((item) => filterByState(item, value.state));

        $ctrl.features = list.slice(0, 4);
        $ctrl.featuresAfter = list.slice(4);
    }

    const setActiveCounts = () => {
        const active = $ctrl.allFeatures.filter(feature => feature.enabled).length;
        const notActive = $ctrl.allFeatures.filter(feature => !feature.enabled).length;

        $ctrl.active_options = [{
            value: 'all',
            name: 'Alle',
        }, {
            value: 'active',
            name: `Actief (${active})`,
        }, {
            value: 'available',
            name: `Niet Actief (${notActive})`,
        }];
    }

    $ctrl.openContactModal = () => {
        ModalService.open('featureContact');
    };

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
        'ModalService',
        'FeaturesService',
        FeaturesComponent,
    ],
    templateUrl: 'assets/tpl/pages/features.html',
};