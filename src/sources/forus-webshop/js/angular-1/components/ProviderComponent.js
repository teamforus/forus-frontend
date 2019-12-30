let ProviderComponent = function(
    $state
) {
    let $ctrl = this;

    let avg = (values) => {
        return values.reduce((avg, value) => value + avg, 0) / values.length;
    }

    $ctrl.goToOffice = (office) => {
        $state.go('provider-office', {
            provider_id: office.organization_id,
            office_id: office.id
        });
    };

    $ctrl.$onInit = () => {
        let offices = $ctrl.provider.offices;

        $ctrl.mapOptions = {
            zoom: 11,
            lat: avg(offices.map(office => parseFloat(office.lat))),
            lon: avg(offices.map(office => parseFloat(office.lon))),
        };
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