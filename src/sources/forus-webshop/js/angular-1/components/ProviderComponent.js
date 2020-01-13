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

    $ctrl.$onInit = () => {};
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