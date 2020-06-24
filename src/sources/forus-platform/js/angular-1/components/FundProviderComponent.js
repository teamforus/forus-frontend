let FundProviderComponent = function(
    $q,
    $state,
    FundService,
    OfficeService,
    ProductService,
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
                enable_products: product.allowed ? [
                    product.id
                ] : [],
                disable_products: !product.allowed ? [
                    product.id
                ] : []
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

    $ctrl.onPageChange = (query = {}) => {
        return $q((resolve, reject) => {
            ProductService.list(
                $ctrl.fundProvider.organization_id,
                Object.assign({}, query)
            ).then((res) => {
                resolve($ctrl.products = {
                    meta: res.data.meta,
                    data: $ctrl.transformProductsList(res.data.data),
                });
            }, reject);
        });
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
        let organization =  $ctrl.fundProvider.organization;
        let properties = [];

        if (organization.email) {
            properties.push({
                label: "E-mail",
                value: organization.email,
                primary: true,
            });
        }

        if (organization.website) {
            properties.push({
                label: "Website",
                value: organization.website,
                primary: true,
            });
        }

        if (organization.phone) {
            properties.push({
                label: "Telefoonnummer",
                value: organization.phone,
                primary: true,
            });
        }

        if (organization.kvk) {
            properties.push({
                label: "KVK",
                value: organization.kvk,
            });
        }

        if (organization.iban) {
            properties.push({
                label: "IBAN",
                value: organization.iban,
            });
        }

        if (organization.btw) {
            properties.push({
                label: "BTW",
                value: organization.btw,
            });
        }

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
        'OfficeService',
        'ProductService',
        'PushNotificationsService',
        FundProviderComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-provider.html'
};