const ModalProductReserveDetailsComponent = function(
    $state,
    ProductReservationService,
    PushNotificationsService,
    FormBuilderService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.state = 'fill_notes';

        $ctrl.product = $ctrl.modal.scope.product;
        $ctrl.voucher = $ctrl.modal.scope.voucher;
        $ctrl.provider = $ctrl.voucher.fund.organization;

        $ctrl.form = FormBuilderService.build({}, (form) => {
            ProductReservationService.reserve({
                ...form.values,
                voucher_address: $ctrl.voucher.address,
                product_id: $ctrl.product.id
            }).then($ctrl.onReserved, $ctrl.onError);
        });
    };

    $ctrl.onReserved = () => {
        $ctrl.close();

        $state.go('reservations');
        PushNotificationsService.success('Gelukt!', 'Het aanbod is gereserveerd!.');
    };

    $ctrl.onError = (res) => {
        const { errors, message } = res.data;
        const firstError = typeof errors === 'object' ? Object.values(errors)[0] : null

        PushNotificationsService.danger(firstError ? firstError[0] || message : message);
    };

    $ctrl.productReserve = () => {
        ProductReservationService.validate({
            ...$ctrl.form.values,
            voucher_address: $ctrl.voucher.address,
            product_id: $ctrl.product.id,
        }).then(() => {
            $ctrl.form.errors = {};
            $ctrl.state = 'confirm_notes';
        }, res => {
            $ctrl.form.unlock();
            $ctrl.form.errors = res.data.errors;
        });
    };

    $ctrl.confirmSubmit = () => {
        $ctrl.form.submit();
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
        product: '<',
        voucher: '<',
    },
    controller: [
        '$state',
        'ProductReservationService',
        'PushNotificationsService',
        'FormBuilderService',
        ModalProductReserveDetailsComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-product-reserve-details.html';
    }
};