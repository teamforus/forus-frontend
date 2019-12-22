let ModalFundOffersComponent = function(
    ProductService,
    FundService,
    OrganizationService,
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.fund = $ctrl.modal.scope.fund;
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.providerFund = $ctrl.modal.scope.providerFund;
        $ctrl.offers = $ctrl.modal.scope.offers;

        FundService.readProvider(
            $ctrl.fund.organization.id, 
            $ctrl.fund.id, 
            $ctrl.providerFund.id
        ).then(res => {
            $ctrl.enabledProducts = res.data.data.products;

            $ctrl.mapOffersAllowedProperty();
        });
    };

    $ctrl.onPageChange = (query) => {
        let _query = JSON.parse(JSON.stringify(query));

        ProductService.list($ctrl.organization.id, _query).then(res => {
            $ctrl.offers = res.data;

            $ctrl.mapOffersAllowedProperty();
        });
    };

    $ctrl.mapOffersAllowedProperty = () => {
        $ctrl.offers.data.map(offer => {
            offer.allowed = $ctrl.enabledProducts.indexOf(offer.id) !== -1 || $ctrl.providerFund.allow_products;
        });
    }
    
    $ctrl.$onDestroy = function() {};
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'ProductService',
        'FundService',
        'OrganizationService',
        ModalFundOffersComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-fund-offers.html';
    }
};