const { pick } = require("lodash");

const ProductsComponent = function (
    $state,
    $stateParams,
    appConfigs,
    ModalService,
    ProductService,
    PageLoadingBarService,
) {
    const $ctrl = this;

    $ctrl.filters = pick($stateParams, [
        'q', 'source', 'per_page',
    ]);

    $ctrl.maxProductCount = parseInt(appConfigs.features.products_hard_limit);
    $ctrl.maxProductSoftLimit = parseInt(appConfigs.features.products_soft_limit);

    $ctrl.onPageChange = async (query) => {
        const data = { ...query, ...$ctrl.filters };
        $ctrl.loading = true;
        PageLoadingBarService.setProgress(0);

        ProductService.list($ctrl.organization.id, data).then((res) => {
            $ctrl.products = res.data;
            $ctrl.updateState(data);
        }).finally(() => {
            $ctrl.loading = false;
            PageLoadingBarService.setProgress(100);
        });
    };

    $ctrl.updateState = (query) => {
        $state.go('products', { ...query }, { location: 'replace' });
    };

    $ctrl.addProduct = function () {
        if (!$ctrl.maxProductCount || $ctrl.products.meta.total < $ctrl.maxProductCount) {
            $state.go('products-create', pick($stateParams, 'organization_id'));
        }
    };

    $ctrl.deleteProduct = function (product) {
        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'products.confirm_delete.title',
            description: 'products.confirm_delete.description',
            icon: 'product-create',
            confirm: () => ProductService.destroy(product.organization_id, product.id).then(() => $state.reload()),
        });
    };

    $ctrl.$onInit = function () {
        $ctrl.emptyBlockLink = $state.href('products-create', pick($stateParams, 'organization_id'));
    };
};

module.exports = {
    bindings: {
        products: '<',
        organization: '<',
    },
    controller: [
        '$state',
        '$stateParams',
        'appConfigs',
        'ModalService',
        'ProductService',
        'PageLoadingBarService',
        ProductsComponent
    ],
    templateUrl: 'assets/tpl/pages/products.html'
};