let ModalFundOffersComponent = function (
    ProductService,
    ProviderFundService,
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.fund = $ctrl.modal.scope.fund;
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.providerFund = $ctrl.modal.scope.providerFund;

        ProviderFundService.readFundProvider(
            $ctrl.organization.id,
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
            offer.allowed = $ctrl.enabledProducts.indexOf(offer.id) !== -1;
            let fund = offer.funds.filter(fund => fund.id === $ctrl.fund.id)[0];

            if (fund) {
                offer.subsidy_amount = offer.price - fund.price;
                offer.subsidy_user_amount = fund.price;
                offer.subsidy_user_limit = fund.limit_per_identity;
                offer.subsidy_limit_total = fund.limit_total;
                offer.subsidy_limit_total_unlimited = fund.limit_total_unlimited;
            }

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
        'ProviderFundService',
        ModalFundOffersComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-fund-offers.html';
    }
};