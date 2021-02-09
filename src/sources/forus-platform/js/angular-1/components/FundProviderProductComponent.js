let FundProviderProductsComponent = function(
    $stateParams,
    ProviderFundService,
    FundService,
    ModalService,
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.filters = {
        values: {
            q: "",
            per_page: 15
        },
    };

    $ctrl.openSubsidyProductModal = function(
        fundProvider,
        product,
        readOnly = false,
        readValues = {}
    ) {
        ModalService.open('subsidyProductEdit', {
            fund: fundProvider.fund,
            product: product,
            readOnly: readOnly,
            readValues: readValues,
            fundProvider: fundProvider,
            onApproved: (fundProvider) => {
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.updateProviderProduct(fundProvider);
                $ctrl.$onInit();
            }
        });
    };

    $ctrl.disableProductItem = function(fundProvider, product) {
        FundService.stopActionConfirmationModal(() => {
            fundProvider.product_allowed = false;
            $ctrl.updateAllowBudgetItem(fundProvider, product);
        });
    };

    $ctrl.updateProviderProduct = (fundProvider) => {
        FundService.getProviderProduct(
            $stateParams.organization_id,
            fundProvider.fund.id,
            fundProvider.id,
            $stateParams.product_id,
        ).then((res) => {
            $ctrl.product = res.data.data;
        });
    }

    $ctrl.disableProductItem = function(fundProvider, product) {
        ModalService.open("dangerZone", {
            title: "U verwijderd hiermee het aanbod permanent uit de webshop",
            description: "U dient aanbieders en inwoners hierover te informeren.",
            cancelButton: "Annuleer",
            confirmButton: "Stop actie",
            onConfirm: () => {
                fundProvider.product_allowed = false;
                $ctrl.updateAllowBudgetItem(fundProvider, product);
            }
        });
    };

    $ctrl.updateAllowBudgetItem = function(fundProvider, product) {
        FundService.updateProvider(
            fundProvider.fund.organization_id,
            fundProvider.fund.id,
            fundProvider.id, {
            enable_products: fundProvider.product_allowed ? [{
                id: product.id
            }] : [],
            disable_products: !fundProvider.product_allowed ? [product.id] : [],
        }
        ).then(() => {
            PushNotificationsService.success('Opgeslagen!');
        }, console.error);
    };

    $ctrl.transformProduct = (product) => {
        $ctrl.providerFunds = $ctrl.providerFunds.map(providerFund => {
            let activeDeals = providerFund.product_deals_history ? 
                providerFund.product_deals_history.filter(deal => deal.active) : [];
    
            providerFund.product_allowed = providerFund.products.indexOf(product.id) !== -1;
            providerFund.product_active_deal = activeDeals.length > 0 ? activeDeals[0] : null;

            return providerFund;
        });
    };

    $ctrl.$onInit = function() {
        FundService.list($ctrl.organization.id).then(res => {
            $ctrl.organizationFunds    = res.data.data;
            $ctrl.organizationFundsIds = $ctrl.organizationFunds.map(fund => fund.id);

            ProviderFundService.listFunds(
                $stateParams.fund_provider_organization_id
            ).then(res => {
                $ctrl.providerFunds = res.data.data.filter(providerFund => {
                    return $ctrl.organizationFundsIds.indexOf(providerFund.fund.id) !== -1;
                });
                
                $ctrl.transformProduct($ctrl.product);
            });
        });
    };
};

module.exports = {
    bindings: {
        organization: '<',
        fundProvider: '<',
        product: '<'
    },
    controller: [
        '$stateParams',
        'ProviderFundService',
        'FundService',
        'ModalService',
        'PushNotificationsService',
        FundProviderProductsComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-provider-product.html'
};