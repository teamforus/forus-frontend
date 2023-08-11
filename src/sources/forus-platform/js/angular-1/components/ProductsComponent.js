const ProductsComponent = function(
    $q,
    $state,
    $stateParams,
    appConfigs,
    ProductService,
    ModalService
) {
    const $ctrl = this;

    $ctrl.filters = {
        values: {
        },
    };

    $ctrl.maxProductCount = parseInt(appConfigs.features.products_hard_limit);
    $ctrl.maxProductSoftLimit = parseInt(appConfigs.features.products_soft_limit);

    $ctrl.onPageChange = async (query) => {
        return $q((resolve, reject) => {
            const data = { ...query, ...$ctrl.filters.values };

            ProductService.list($ctrl.organization.id, data).then((res => {
                $ctrl.products = { meta: res.data.meta, data: res.data.data };
                resolve($ctrl.products);
            }), reject);
        });
    };

    $ctrl.$onInit = function() {
        $ctrl.onPageChange().then(() => {
            $ctrl.emptyBlockLink = $state.href('products-create', $stateParams);
            $ctrl.cardLevel = "list";
        });
    };

    $ctrl.addProduct = function() {
        if (!$ctrl.maxProductCount || $ctrl.products.meta.total < $ctrl.maxProductCount) {
            $state.go('products-create', { organization_id: $stateParams.organization_id });
        }
    };

    $ctrl.deleteProduct = function(product) {
        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'products.confirm_delete.title',
            description: 'products.confirm_delete.description',
            icon: 'product-create',
            confirm: () => {
                ProductService.destroy(
                    product.organization_id,
                    product.id
                ).then(() => {
                    $state.reload();
                });
            }
        });
    };

    $ctrl.srefData = {
        provider: { ...$stateParams, ...{ source: 'provider' } },
        sponsor: { ...$stateParams, ...{ source: 'sponsor' } },
        archive: { ...$stateParams, ...{ source: 'archive' } },
    };
};

module.exports = {
    bindings: {
        products: '<',
        organization: '<',
    },
    controller: [
        '$q',
        '$state',
        '$stateParams',
        'appConfigs',
        'ProductService',
        'ModalService',
        ProductsComponent
    ],
    templateUrl: 'assets/tpl/pages/products.html'
};