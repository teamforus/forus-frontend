let ModalFundOffersComponent = function (
    ProductService,
    FundService,
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.fund = $ctrl.modal.scope.fund;
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.providerFund = $ctrl.modal.scope.providerFund;

        FundService.readProvider(
            $ctrl.fund.organization.id,
            $ctrl.fund.id,
            $ctrl.providerFund.id
        ).then(res => {
            $ctrl.enabledProducts = res.data.data.products;
            $ctrl.offers = $ctrl.mapOffersAllowedProperty($ctrl.modal.scope.offers);
        });
    };

    $ctrl.onPageChange = (query) => {
        let _query = JSON.parse(JSON.stringify(query));

        ProductService.list($ctrl.organization.id, _query).then(res => {
            $ctrl.offers = $ctrl.mapOffersAllowedProperty(res.data);
        });
    };

    $ctrl.mapOffersAllowedProperty = (offers) => {
        offers.data.forEach(offer => {
            offer.allowed = $ctrl.enabledProducts.indexOf(
                offer.id
            ) !== -1 || $ctrl.providerFund.allow_products;
        });

        return offers;
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'ProductService',
        'FundService',
        ModalFundOffersComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-fund-offers.html';
    }
};