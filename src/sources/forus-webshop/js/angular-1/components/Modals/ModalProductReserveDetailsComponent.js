const ModalProductReserveDetailsComponent = function(
    $state,
    $filter,
    AuthService,
    FormBuilderService,
    IdentityEmailsService,
    PushNotificationsService,
    ProductReservationService,
    OrganizationReservationFieldService,
) {
    const $ctrl = this;
    const $trans = $filter('translate');

    $ctrl.dateMinLimit = new Date();
    $ctrl.fields = [];
    $ctrl.customFields = [];
    $ctrl.lastField = null;

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

    const mapFields = () => {
        let count = 2; // fist and last names
        let required = false;
        let label = null;

        if ($ctrl.product.reservation.phone !== 'no') {
            required = $ctrl.product.reservation.phone === 'required';
            label = required
                ? 'modal_product_reserve_notes.fill_notes.labels.phone'
                : 'modal_product_reserve_notes.fill_notes.labels.phone_optional';

            $ctrl.fields.push({
                label: $trans(label),
                placeholder: $trans('modal_product_reserve_notes.fill_notes.placeholders.phone'),
                custom: false,
                required: required,
                key: 'phone',
                dusk: 'productReserveFormPhone',
                type: 'text',
                class: '',
            });

            count++;

            if ($ctrl.product.reservation.address === 'no' && $ctrl.product.reservation.birth_date === 'no') {
                $ctrl.lastField = 'phone';
            }
        }

        if ($ctrl.product.reservation.address !== 'no') {
            required = $ctrl.product.reservation.address === 'required';
            label = required
                ? 'modal_product_reserve_notes.fill_notes.labels.address'
                : 'modal_product_reserve_notes.fill_notes.labels.address_optional';

            $ctrl.fields.push({
                label: $trans(label),
                placeholder: $trans('modal_product_reserve_notes.fill_notes.placeholders.address'),
                custom: false,
                required: required,
                key: 'address',
                dusk: 'productReserveFormAddress',
                type: 'text',
                class: '',
            });

            count++;

            if ($ctrl.product.reservation.birth_date === 'no') {
                $ctrl.lastField = 'address';
            }
        }

        if ($ctrl.product.reservation.birth_date !== 'no') {
            required = $ctrl.product.reservation.birth_date === 'required';
            label = required
                ? 'modal_product_reserve_notes.fill_notes.labels.birth_date'
                : 'modal_product_reserve_notes.fill_notes.labels.birth_date_optional';

            $ctrl.fields.push({
                label: $trans(label),
                placeholder: '',
                custom: false,
                required: required,
                key: 'birth_date',
                dusk: null,
                type: 'date',
                class: '',
            });

            count++;

            if (!$ctrl.customFields.length) {
                $ctrl.lastField = 'birth_date';
            }
        }

        count += $ctrl.customFields.length;
        $ctrl.haveFullWidth = count % 2 !== 0;

        if ($ctrl.customFields.length && $ctrl.haveFullWidth) {
            $ctrl.lastField = $ctrl.customFields[$ctrl.customFields.length - 1].key;
        }

        $ctrl.fields = [...$ctrl.fields, ...$ctrl.customFields];
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

        OrganizationReservationFieldService.list($ctrl.product.organization_id)
            .then((res) => {
                $ctrl.customFields = res.data.data.map((field) => {
                    return {
                        label: field.label,
                        placeholder: field.label,
                        description: field.description,
                        custom: true,
                        required: field.required,
                        key: field.id,
                        dusk: null,
                        type: field.type,
                        class: 'form-group-info-tooltip',
                    };
                });
            }).finally(mapFields);
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
        'IdentityEmailsService',
        'PushNotificationsService',
        'ProductReservationService',
        'OrganizationReservationFieldService',
        ModalProductReserveDetailsComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-product-reserve-details.html',
};