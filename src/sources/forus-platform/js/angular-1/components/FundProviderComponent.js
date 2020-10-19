let FundProviderComponent = function(
    $q,
    $state,
    FundService,
    ModalService,
    OfficeService,
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.filters = {
        values: {
            q: "",
            per_page: 15
        },
    };

    $ctrl.tab = "employees";

    $ctrl.openSubsidyProductModal = function(fundProvider, product) {
        ModalService.open('subsidyProductEdit', {
            product: product,
            fund: fundProvider.fund,
            fundProvider: fundProvider,
            onApproved: (fundProvider) => {
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.fundProvider = fundProvider;
                $ctrl.fetchProducts(fundProvider, $ctrl.filters.values);
            }
        });
    };

    $ctrl.disableProductItem = function(fundProvider, product) {
        ModalService.open("dangerZone", {
            title: "U verwijderd hiermee het aanbod permanent uit de webshop",
            description: "U dient aanbieders en inwoners hierover te informeren.",
            cancelButton: "Annuleer",
            confirmButton: "Stop actie",
            onConfirm: () => {
                product.allowed = false;
                $ctrl.updateAllowBudgetItem(fundProvider, product);
            }
        });
    };

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

    $ctrl.updateAllowBudgetItem = function(fundProvider, product) {
        FundService.updateProvider(
            fundProvider.fund.organization_id,
            fundProvider.fund.id,
            fundProvider.id, {
            enable_products: product.allowed ? [{
                id: product.id
            }] : [],
            disable_products: !product.allowed ? [product.id] : [],
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

    $ctrl.fetchProducts = (fundProvider, query = {}) => {
        return $q((resolve, reject) => {
            FundService.listProviderProducts(
                fundProvider.fund.organization_id,
                fundProvider.fund.id,
                fundProvider.id,
                Object.assign({}, query)
            ).then((res) => {
                resolve($ctrl.products = {
                    meta: res.data.meta,
                    data: $ctrl.transformProductsList(res.data.data),
                });
            }, reject);
        });
    };

    $ctrl.onPageChange = (query = {}) => {
        return $ctrl.fetchProducts($ctrl.fundProvider, query);
    };

    $ctrl.transformProduct = (product) => {
        product.allowed = $ctrl.fundProvider.products.indexOf(product.id) !== -1;
        return product;
    };

    $ctrl.transformProductsList = (products) => {
        return products.map(product => $ctrl.transformProduct(product));
    };

    $ctrl.openProductDetails = (product) => {
        $state.go('fund-provider-product', {
            organization_id: $ctrl.organization.id,
            fund_provider_id: $ctrl.fundProvider.id,
            fund_id: $ctrl.fund.id,
            product_id: product.id,
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
        let organization = $ctrl.fundProvider.organization;
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

        let count = properties.length;

        $ctrl.properties = [
            properties.splice(0, count == 4 ? 4 : 3),
            properties.splice(0, count == 4 ? 4 : 3)
        ];
    };

    $ctrl.$onInit = function() {
        $ctrl.onPageChange($ctrl.filters.values).then(() => {
            OfficeService.list($ctrl.fundProvider.organization_id, {
                per_page: 100
            }).then(res => {
                $ctrl.offices = res.data;
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
        'FundService',
        'ModalService',
        'OfficeService',
        'PushNotificationsService',
        FundProviderComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-provider.html'
};