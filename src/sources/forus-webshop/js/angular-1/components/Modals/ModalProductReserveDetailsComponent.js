const ModalProductReserveDetailsComponent = function (
    $state,
    $filter,
    AuthService,
    FormBuilderService,
    OrganizationService,
    IdentityEmailsService,
    PushNotificationsService,
    ProductReservationService,
) {
    const $ctrl = this;
    const $trans = (key) => $filter('translate')(`modal_product_reserve_notes.${key}`);

    $ctrl.dateMinLimit = new Date();
    $ctrl.fields = [];

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

    $ctrl.makeReservationField = (key, type, dusk = null) => {
        const required = $ctrl.product.reservation[key] === 'required';

        const label = $trans(`fill_notes.labels.${key}${required ? '' : '_optional'}`);
        const placeholder = $trans(`fill_notes.placeholders.${key}`);

        return { label, placeholder, required, key, dusk, type, custom: false }
    }

    $ctrl.mapFields = (customFields = []) => {
        if ($ctrl.product.reservation.phone !== 'no') {
            $ctrl.fields.push($ctrl.makeReservationField('phone', 'text', 'productReserveFormPhone'));
        }

        if ($ctrl.product.reservation.address !== 'no') {
            $ctrl.fields.push($ctrl.makeReservationField('address', 'text', 'productReserveFormAddress'));
        }

        if ($ctrl.product.reservation.birth_date !== 'no') {
            $ctrl.fields.push($ctrl.makeReservationField('birth_date', 'date'));
        }

        $ctrl.fields = [...$ctrl.fields, ...customFields];

        if ($ctrl.fields.length > 0) {
            $ctrl.fields[$ctrl.fields.length - 1].fullWidth = $ctrl.fields.length % 2 !== 0;
        }
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
            ProductReservationService.reserve({
                ...form.values,
                voucher_address: $ctrl.voucher.address,
                product_id: $ctrl.product.id,
            }).then($ctrl.onReserved, $ctrl.onError);
        }, true);

        AuthService.identity().then((res) => {
            if (!res.data.email) {
                $ctrl.emailSetupShow = true;
                $ctrl.emailForm = $ctrl.makeEmailForm();
            }
        });

        OrganizationService.reservationFields($ctrl.product.organization_id).then((res) => {
            $ctrl.mapFields(res.data.data.map((field) => ({
                label: field.label,
                placeholder: field.label,
                description: field.description,
                custom: true,
                required: field.required,
                key: field.id,
                dusk: `customField${field.id}`,
                type: field.type,
            })));
        }, () => $ctrl.mapFields());
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
        '$filter',
        'AuthService',
        'FormBuilderService',
        'OrganizationService',
        'IdentityEmailsService',
        'PushNotificationsService',
        'ProductReservationService',
        ModalProductReserveDetailsComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-product-reserve-details.html',
};