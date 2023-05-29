const ProviderComponent = function($rootScope, $sce, $filter, $stateParams) {
    const $ctrl = this;
    const $i18n = $filter('i18n');

    $ctrl.mapOptions = {
        zoom: 11,
        centerType: 'avg',
    };

    $ctrl.$onInit = () => {
        $ctrl.searchData = $stateParams.searchData || null;
        $ctrl.provider.description_html = $sce.trustAsHtml($ctrl.provider.description_html);

        $rootScope.pageTitle = $i18n('page_state_titles.provider', {
            provider_name: $ctrl.provider.name,
        });
    };
};

module.exports = {
    bindings: {
        provider: '<',
        products: '<',
        subsidies: '<',
    },
    controller: [
        '$rootScope',
        '$sce',
        '$filter',
        '$stateParams',
        ProviderComponent
    ],
    templateUrl: 'assets/tpl/pages/provider.html',
};