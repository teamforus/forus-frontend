const ModalProductReserveDetailsComponent = function(
    $state,
    AuthService,
    FormBuilderService,
    IdentityEmailsService,
    PushNotificationsService,
    ProductReservationService,
) {
    const $ctrl = this;
    
    $ctrl.dateMinLimit = new Date();

    // Initialize authorization form
    $ctrl.makeEmailForm = () => {
        return FormBuilderService.build({
            email: ``,
        }, (form) => {
            IdentityEmailsService.store(form.values.email, {
                target: `productReservation-${$ctrl.product.id}`,
            }).then(() => {
                $ctrl.emailSubmitted = true;
                PushNotificationsService.success('Success!', 'An email was sent!.');
            }, (res) => {
                form.errors = res.status === 429 ? {
                    email: [res.data.message],
                } : res.data.errors;
            }).finally(() => form.unlock());
        }, true);
    };

    $ctrl.$onInit = () => {
        $ctrl.state = 'fill_notes';
        $ctrl.emailSetupShow = false;
        $ctrl.emailSubmitted = false;
        $ctrl.emailShowForm = false;

        $ctrl.product = $ctrl.modal.scope.product;
        $ctrl.voucher = $ctrl.modal.scope.voucher;
        $ctrl.provider = $ctrl.product.organization;

        $ctrl.form = FormBuilderService.build({}, (form) => {
            form.lock();

            ProductReservationService.reserve({
                ...form.values,
                voucher_address: $ctrl.voucher.address,
                product_id: $ctrl.product.id
            }).then($ctrl.onReserved, $ctrl.onError);
        });

        AuthService.identity().then((res) => {
            if (!res.data.email) {
                $ctrl.emailSetupShow = true;
                $ctrl.emailForm = $ctrl.makeEmailForm();
            }
        });
    };

    $ctrl.addEmail = () => {
        $ctrl.emailShowForm = true;
    };

    $ctrl.onReserved = () => {
        $ctrl.close();

        $state.go('reservations');
        PushNotificationsService.success('Gelukt!', 'Het aanbod is gereserveerd!.');
    };

    $ctrl.onError = (res) => {
        const { errors = {}, message } = res.data;

        $ctrl.form.errors = errors;
        $ctrl.form.unlock();

        if (errors.product_id) {
            errors.product_id?.forEach((error) => PushNotificationsService.danger(error));
        }
        
        if (!errors.product_id && message) {
            PushNotificationsService.danger(message);
        }
    };

    $ctrl.productReserve = () => {
        ProductReservationService.validate({
            ...$ctrl.form.values,
            voucher_address: $ctrl.voucher.address,
            product_id: $ctrl.product.id,
        }).then(() => {
            $ctrl.form.errors = {};
            $ctrl.state = 'confirm_notes';
        }, $ctrl.onError);
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
        'AuthService',
        'FormBuilderService',
        'IdentityEmailsService',
        'PushNotificationsService',
        'ProductReservationService',
        ModalProductReserveDetailsComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-product-reserve-details.html',
};