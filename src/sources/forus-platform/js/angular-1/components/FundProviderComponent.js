let FundProviderComponent = function(
    $q,
    FundService,
    OfficeService,
    OrganizationEmployeesService,
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

    $ctrl.tab = "products";

    $ctrl.updateAllowBudget = function(fundProvider) {
        FundService.updateProvider(
            fundProvider.fund.organization_id,
            fundProvider.fund.id,
            fundProvider.id, {
                allow_budget: fundProvider.allow_budget
            }
        ).then((res) => {
            PushNotificationsService.success('Saved!');
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
            PushNotificationsService.success('Saved!');
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
            PushNotificationsService.success('Saved!');
            $ctrl.fundProvider = res.data.data;
        }, console.error);
    };

    $ctrl.onPageChange = (query = {}) => {
        return $q((resolve, reject) => {
            ProductService.list(
                $ctrl.fundProvider.organization_id,
                Object.assign({}, query)
            ).then((res) => {
                $ctrl.products = {
                    meta: res.data.meta,
                    data: $ctrl.transformProductsList(res.data.data),
                }
                resolve($ctrl.products = res.data);
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

    $ctrl.$onInit = function() {
        $ctrl.onPageChange($ctrl.filters.values).then(() => {
            OfficeService.list($ctrl.fundProvider.organization_id).then(res => {
                $ctrl.offices = res.data;
            });
        });
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
        'FundService',
        'OfficeService',
        'OrganizationEmployeesService',
        'ProductService',
        'PushNotificationsService',
        FundProviderComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-provider.html'
};