const ModalReservationNotesComponent = function(
    $state,
    ProductReservationService,
    PushNotificationsService,
    FormBuilderService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.product = $ctrl.modal.scope.product;
        $ctrl.voucher = $ctrl.modal.scope.voucher;
        $ctrl.providerName = $ctrl.voucher.fund.organization.name;

        $ctrl.state = 'fill_notes';

        $ctrl.form = FormBuilderService.build({}, (form) => {
            ProductReservationService.reserve(
                Object.assign(form.values, {
                    voucher_address: $ctrl.voucher.address,
                    product_id: $ctrl.product.id,
                })
            ).then($ctrl.onReserved, $ctrl.onError);
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
        ProductReservationService.validate(
            Object.assign($ctrl.form.values, {
                voucher_address: $ctrl.voucher.address,
                product_id: $ctrl.product.id,
            })
        ).then(() => {
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
        ModalReservationNotesComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-reservation-notes.html';
    }
};