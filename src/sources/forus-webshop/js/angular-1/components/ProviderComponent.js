const ProviderComponent = function($sce, $stateParams) {
    const $ctrl = this;

    $ctrl.mapOptions = {
        zoom: 11,
        centerType: 'avg',
    };

    $ctrl.$onInit = () => {
        $ctrl.searchData = $stateParams.searchData || null;
        $ctrl.provider.description_html = $sce.trustAsHtml($ctrl.provider.description_html);
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
        ProviderComponent
    ],
    templateUrl: 'assets/tpl/pages/provider.html'
};