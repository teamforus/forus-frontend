const IdentitiesShowComponent = function() {
    const $ctrl = this;

    $ctrl.registerVouchersDirective = (directive) => {
        $ctrl.vouchersDirective = directive;
    };

    $ctrl.$onInit = () => {
        $ctrl.vouchersFilters = {
            order_by: 'id',
            order_dir: 'asc',
            per_page: 10,
            type: 'all',
            source: 'all',
            fund_id: $ctrl.fund.id,
            identity_address: $ctrl.identity.address,
        };
    }
};

module.exports = {
    bindings: {
        organization: '<',
        fund: '<',
        identity: '<',
    },
    controller: [
        IdentitiesShowComponent
    ],
    templateUrl: 'assets/tpl/pages/identities-show.html'
};