let OrganizationProviderComponent = function(
    $q,
    $state,
    $stateParams,
    FundService,
    ProviderFundService,
    ProductService,
    OfficeService,
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.fundFilters = {
        values: {
            q: "",
            per_page: 15
        },
    };

    $ctrl.fundProviderFilters = {
        values: {
            q: "",
            per_page: 15
        },
    };

    $ctrl.tab = "employees";

    $ctrl.updateAllowBudget = function(fundProvider) {
        FundService.updateProvider(
            fundProvider.fund.organization_id,
            fundProvider.fund.id,
            fundProvider.id, {
            allow_budget: fundProvider.allow_budget
        }
        ).then((res) => {
            PushNotificationsService.success('Opgeslagen!');
            $ctrl.fundProvider = res.data.data;
        }, console.error);
    };

    $ctrl.updateAllowProducts = function(fundProvider) {
        FundService.updateProvider(
            fundProvider.fund.organization_id,
            fundProvider.fund.id,
            fundProvider.id, {
            allow_products: fundProvider.allow_products
        }
        ).then((res) => {
            PushNotificationsService.success('Opgeslagen!');
            $ctrl.fundProvider = res.data.data;
        }, console.error);
    };

    $ctrl.fetchProducts = (query = {}) => {
        return $q((resolve, reject) => {
            ProductService.list(
                $stateParams.fund_provider_organization_id,
                Object.assign({}, query)
            ).then((res) => {
                resolve($ctrl.products = {
                    meta: res.data.meta,
                    data: $ctrl.transformProductsList(res.data.data),
                });
            }, reject);
        });
    };

    $ctrl.fetchFundProviders = (query = {}) => {
        let organizationFundsIds = $ctrl.organizationFunds.map(fund => fund.id);

        return $q((resolve, reject) => {
            ProviderFundService.listFunds(
                $stateParams.fund_provider_organization_id
            ).then(res => {
                $ctrl.providerFundsEmployees = res.data.data[0].employees;

                $ctrl.providerFunds = res.data.data.filter(providerFund => {
                    return providerFund.fund.type == 'budget' && organizationFundsIds.indexOf(
                        providerFund.fund.id
                    ) !== -1;
                });

                $ctrl.providerFundsProducts  = [];
                $ctrl.providerFunds.forEach(providerFund => {
                    if (providerFund.products && providerFund.products.length) {
                        $ctrl.providerFundsProducts.push(providerFund.products);
                    }
                });
                
                resolve($ctrl.providerFunds);
            }, reject);
        });
    };

    $ctrl.onProductsPageChange = (query = {}) => {
        return $ctrl.fetchProducts(query);
    };

    $ctrl.onFundPageChange = (query = {}) => {
        return $ctrl.fetchFundProviders(query);
    };

    $ctrl.transformProduct = (product) => {
        product.allowed = $ctrl.providerFundsProducts.indexOf(product.id) !== -1;
        return product;
    };

    $ctrl.transformProductsList = (products) => {
        return products.map(product => $ctrl.transformProduct(product));
    };

    $ctrl.openProductDetails = (product) => {
        $state.go('fund-provider-product', {
            organization_id: $ctrl.organization.id,
            fund_provider_organization_id: $stateParams.fund_provider_organization_id,
            product_id: product.id
        });
    };

    $ctrl.dismissProvider = function(fundProvider) {
        FundService.dismissProvider(
            fundProvider.fund.organization_id,
            fundProvider.fund.id,
            fundProvider.id
        ).then((res) => {
            PushNotificationsService.success(
                'Verborgen!',
                "Pas de filters aan om verborgen aanbieders terug te vinden."
            );

            $ctrl.fundProvider = res.data.data;
            $ctrl.transformProductsList($ctrl.products.data);
        });
    };

    $ctrl.prepareProperties = () => {
        let organization = $ctrl.organization;
        let properties = [];

        let makeProp = (label, value, primary = false) => ({
            label: label,
            value: value,
            primary: primary,
        });

        organization.email && properties.push(makeProp("E-mail", organization.email, true));
        organization.website && properties.push(makeProp("Website", organization.website, true));
        organization.phone && properties.push(makeProp("Telefoonnummer", organization.phone, true));
        organization.kvk && properties.push(makeProp("KVK", organization.kvk));
        organization.iban && properties.push(makeProp("IBAN", organization.iban))
        organization.btw && properties.push(makeProp("BTW", organization.btw));

        $ctrl.properties = properties;
    };

    $ctrl.$onInit = function() {
        FundService.list($ctrl.organization.id).then(res => {
            $ctrl.organizationFunds = res.data.data;

            $ctrl.onFundPageChange($ctrl.fundProviderFilters.values).then(() => {
                OfficeService.list($ctrl.organization.id, {
                    per_page: 100
                }).then(res => {
                    $ctrl.offices = res.data;
                });
    
                $ctrl.onProductsPageChange($ctrl.fundFilters.values);
            });
        });

        $ctrl.prepareProperties();
    };
};

module.exports = {
    bindings: {
        organization: '<',
        fundProvider: '<',
        fund: '<'
    },
    controller: [
        '$q',
        '$state',
        '$stateParams',
        'FundService',
        'ProviderFundService',
        'ProductService',
        'OfficeService',
        'PushNotificationsService',
        OrganizationProviderComponent
    ],
    templateUrl: 'assets/tpl/pages/organization-provider.html'
};