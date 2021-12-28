const moment = require("moment");

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

        const reservationExpireDate = moment().startOf('day').add(14, 'day').unix();
        const closestDate = Math.min(reservationExpireDate, $ctrl.modal.scope.meta.shownExpireDate.unix);
        const daysToCancel = moment.unix(closestDate).diff(moment().startOf('day'), 'days');

        $ctrl.transValues = {
            days_to_cancel: daysToCancel,
            product_name: $ctrl.product.name,
            product_price: $ctrl.product.price,
            provider_name: $ctrl.product.organization.name,
            fund_name: $ctrl.vouchers[0].fund.name
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