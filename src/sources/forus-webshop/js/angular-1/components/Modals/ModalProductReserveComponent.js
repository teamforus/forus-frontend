const ModalProductReserveComponent = function(
    appConfigs,
    ModalService,
) {
    const $ctrl = this;

    $ctrl.reserveProduct = (product, voucher) => {
        $ctrl.close();

        ModalService.open('modalProductReserveDetails', { product, voucher });
    };

    $ctrl.$onInit = () => {
        $ctrl.appConfigs = appConfigs;
        $ctrl.product = $ctrl.modal.scope.product;
        $ctrl.vouchers = $ctrl.modal.scope.vouchers;

        $ctrl.transValues = {
            expire_at: $ctrl.expire_at,
            product_name: $ctrl.product.name,
            product_price: $ctrl.product.price,
            org_name: $ctrl.product.organization.name,
        };
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'appConfigs',
        'ModalService',
        ModalProductReserveComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-product-reserve.html';
    }
};