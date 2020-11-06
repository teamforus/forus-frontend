let ProviderComponent = function(
    $state
) {
    let $ctrl = this;

    $ctrl.mapOptions = {
        zoom: 11,
        centerType: 'avg',
    };

    $ctrl.goToOffice = (office) => {
        $state.go('provider-office', {
            provider_id: office.organization_id,
            office_id: office.id
        });
    };

    $ctrl.showMoreProducts = () => {
        $ctrl.shownProductsCount += 9;
        $ctrl.sliceProducts();
    };

    $ctrl.showLessProducts = () => {
        $ctrl.shownProductsCount -= 9;
        $ctrl.sliceProducts();
    };

    $ctrl.sliceProducts = () => {
        $ctrl.shownProducts = $ctrl.provider.products.slice(0, $ctrl.shownProductsCount);
    };

    $ctrl.$onInit = () => {
        if ($ctrl.provider.products) {
            $ctrl.shownProductsCount = 3;
            $ctrl.shownProducts = $ctrl.provider.products.slice(0, $ctrl.shownProductsCount);
        }
    };

    $ctrl.$onDestroy = () => {};
};

module.exports = {
    bindings: {
        provider: '<'
    },
    controller: [
        '$state',
        ProviderComponent
    ],
    templateUrl: 'assets/tpl/pages/provider.html'
};