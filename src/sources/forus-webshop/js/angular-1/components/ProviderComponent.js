const ProviderComponent = function($sce, $stateParams, appConfigs) {
    const $ctrl = this;

    $ctrl.mapOptions = {
        zoom: 11,
        centerType: 'avg',
    };

    $ctrl.$onInit = () => {
        $ctrl.searchData = $stateParams.searchData || null;
        $ctrl.provider.description_html = $sce.trustAsHtml($ctrl.provider.description_html);

        $ctrl.show_map = appConfigs.features.implementation_configs.find(config => {
            return config.page_key == 'provider' && config.page_config_key == "show_map"
        }).is_active;
    };
};

module.exports = {
    bindings: {
        provider: '<',
        products: '<',
        subsidies: '<',
    },
    controller: [
        '$sce',
        '$stateParams',
        'appConfigs',
        ProviderComponent
    ],
    templateUrl: 'assets/tpl/pages/provider.html'
};