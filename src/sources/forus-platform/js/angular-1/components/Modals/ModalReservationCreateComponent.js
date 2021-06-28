const ModalReservationCreateComponent = function(
    VoucherService,
    FormBuilderService,
    ProductReservationService,
) {
    const $ctrl = this;

    $ctrl.products = false;
    $ctrl.formProducts = false;

    $ctrl.makeProductForm = (number, products) => {
        const product = products[0];

        $ctrl.products = products;
        $ctrl.showOverview = false;

        $ctrl.formProducts = FormBuilderService.build({
            note: '',
        }, (form) => {
            const product_id = form.product.id;
            const data = { product_id, number, note: form.values.note };
            form.resetErrors();

            ProductReservationService.store($ctrl.organization.id, data).then((res) => {
                $ctrl.reservation = res.data.data;
                $ctrl.onCreated($ctrl.reservation);
            }, (res) => {
                const { errors, message } = res.data;

                form.errors.product_id = errors ? errors.product_id || errors.number : [message];
                $ctrl.showOverview = false;
            }).finally(() => form.unlock());
        }, true);

        $ctrl.formProducts.product = product;
    };

    $ctrl.makeVoucherForm = (number = '') => {
        $ctrl.form = FormBuilderService.build({ number }, (form) => {
            const number = form.values.number;
            const organization_id = $ctrl.organization.id;

            form.resetErrors();
            $ctrl.products = false;

            VoucherService.readProvider(number).then((res) => {
                const voucher = res.data.data;

                if (voucher.fund.type === 'subsidies' && !$ctrl.organization.reservations_subsidy_enabled) {
                    return form.errors.number = ["Your organization doesn't allow action products reservations."];
                }

                if (voucher.fund.type === 'budget' && !$ctrl.organization.reservations_budget_enabled) {
                    return form.errors.number = ["Your organization doesn't allow budget products reservations."];
                }

                if (!voucher.allowed_organizations.map((item) => item.id).includes($ctrl.organization.id)) {
                    return form.errors.number = ["The voucher is valid but can't be used with current organization."];
                }

                VoucherService.readProviderProducts(number, { organization_id, per_page: 100, reservable: 1 }).then((res) => {
                    const products = res.data.data;

                    if (products.length === 0) {
                        return form.errors.number = ["Voucher is valid, but there are no products available for this number."];
                    }

                    $ctrl.makeProductForm(number, products);
                });

            }, (res) => {
                const { errors, message } = res.data;

                form.errors.number = errors ? errors.address : [message];
            }).finally(() => form.unlock());

        }, true);
    };

    $ctrl.showVoucherForm = function(number = '') {
        $ctrl.formProducts = false;
        $ctrl.makeVoucherForm(number);
    }

    $ctrl.$onInit = () => {
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.onCreated = $ctrl.modal.scope.onCreated;

        $ctrl.makeVoucherForm();
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'VoucherService',
        'FormBuilderService',
        'ProductReservationService',
        ModalReservationCreateComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-reservation-create.html';
    }
};
