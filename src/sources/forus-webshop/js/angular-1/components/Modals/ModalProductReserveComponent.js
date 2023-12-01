const ModalProductReserveComponent = function (
    $state,
    $filter,
    appConfigs,
    AuthService,
    VoucherService,
    FormBuilderService,
    PushNotificationsService,
    ProductReservationService,
) {
    const $ctrl = this;
    const $trans = (key) => $filter('translate')(`modal_product_reserve_notes.${key}`);

    $ctrl.STEP_EMAIL_SETUP = 0;
    $ctrl.STEP_SELECT_VOUCHER = 1;
    $ctrl.STEP_FILL_DATA = 2;
    $ctrl.STEP_FILL_ADDRESS = 3;
    $ctrl.STEP_FILL_NOTES = 4;
    $ctrl.STEP_CONFIRM_DATA = 5;
    $ctrl.STEP_EXTRA_PAYMENT = 6;
    $ctrl.STEP_RESERVATION_FINISHED = 7;

    $ctrl.dateMinLimit = new Date();
    $ctrl.fields = [];
    $ctrl.step = $ctrl.STEP_SELECT_VOUCHER;
    $ctrl.emptyText = $trans('confirm_notes.labels.empty');

    $ctrl.finish = () => {
        $ctrl.close();
        $state.go('reservations');
    };

    $ctrl.onError = (res, address = false) => {
        const { errors = {}, message } = res.data;

        $ctrl.form.errors = errors;
        $ctrl.form.unlock();

        if (errors.product_id) {
            errors.product_id?.forEach((error) => PushNotificationsService.danger(error));
        }

        if (!errors.product_id && message) {
            PushNotificationsService.danger(message);
        }

        $ctrl.setStep(address ? $ctrl.STEP_FILL_ADDRESS : $ctrl.STEP_FILL_DATA);
    };

    $ctrl.validateFields = () => {
        ProductReservationService.validateFields({
            ...$ctrl.form.values,
            voucher_address: $ctrl.voucher.address,
            product_id: $ctrl.product.id,
        }).then(() => {
            $ctrl.form.errors = {};
            $ctrl.next();
        }, (err) => $ctrl.onError(err, false));
    };

    $ctrl.validateAddress = () => {
        ProductReservationService.validateAddress({
            address: $ctrl.form.values.postal_code ? $ctrl.form.values.address : null,
            street: $ctrl.form.values.street,
            house_nr: $ctrl.form.values.house_nr,
            house_nr_addition: $ctrl.form.values.house_nr_addition,
            city: $ctrl.form.values.city,
            postal_code: $ctrl.form.values.postal_code,
            product_id: $ctrl.product.id,
        }).then(() => {
            $ctrl.form.errors = {};
            $ctrl.setStep($ctrl.step + 1);
        }, (err) => $ctrl.onError(err, true));
    };

    $ctrl.goToFinishStep = () => {
        if ($ctrl.voucher.amount_extra > 0) {
            $ctrl.setStep($ctrl.STEP_EXTRA_PAYMENT);
        } else {
            $ctrl.confirmSubmit();
        }
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

        if ($ctrl.product.reservation.birth_date !== 'no') {
            $ctrl.fields.push($ctrl.makeReservationField('birth_date', 'date'));
        }

        $ctrl.fields = [...$ctrl.fields, ...customFields];

        if ($ctrl.fields.length > 0) {
            $ctrl.fields[$ctrl.fields.length - 1].fullWidth = $ctrl.fields.length % 2 !== 0;
        }
    };

    $ctrl.addEmail = () => {
        $state.go('identity-emails');
        $ctrl.close();
    };

    $ctrl.setStep = (step) => {
        $ctrl.step = step;
    };

    $ctrl.back = () => {
        $ctrl.setStep($ctrl.steps[$ctrl.steps.indexOf($ctrl.step) - 1]);
    };

    $ctrl.next = () => {
        $ctrl.setStep($ctrl.steps[$ctrl.steps.indexOf($ctrl.step) + 1]);
    };

    $ctrl.selectVoucher = (voucher) => {
        $ctrl.voucher = voucher;
        $ctrl.setSteps();
        $ctrl.next();
    };

    $ctrl.setSteps = () => {
        $ctrl.steps = [
            $ctrl.STEP_SELECT_VOUCHER,
            $ctrl.STEP_FILL_DATA,
            $ctrl.product.reservation.address !== 'no' ? $ctrl.STEP_FILL_ADDRESS : null,
            $ctrl.STEP_FILL_NOTES,
            $ctrl.STEP_CONFIRM_DATA,
            $ctrl.voucher && $ctrl.voucher.amount_extra > 0 ? $ctrl.STEP_EXTRA_PAYMENT : null
        ].filter((step) => step !== null);
    }

    $ctrl.mapVouchers = (vouchers) => {
        return vouchers.map((item) => VoucherService.composeCardData({ ...item })).map((voucher) => {
            const productPrice = parseFloat($ctrl.product.price);
            const voucherAmount = parseFloat(voucher.amount);

            return {
                ...voucher,
                amount_extra: ($ctrl.extraPaymentAllowed && productPrice > voucherAmount) ?
                    productPrice - voucherAmount : 0,
            }
        })
    }

    $ctrl.$onInit = () => {
        $ctrl.product = $ctrl.modal.scope.product;
        $ctrl.provider = $ctrl.product.organization;
        $ctrl.extraPaymentAllowed = $ctrl.modal.scope.meta.isReservationExtraPaymentAvailable;

        $ctrl.vouchers = $ctrl.mapVouchers($ctrl.modal.scope.vouchers);
        $ctrl.vouchersNeedExtraPayment = $ctrl.vouchers.filter((item) => item.amount_extra > 0).length;

        $ctrl.appConfigs = appConfigs;
        $ctrl.emailSetupShow = false;
        $ctrl.emailSubmitted = false;
        $ctrl.emailShowForm = false;

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

        $ctrl.form = FormBuilderService.build({}, (form) => {
            ProductReservationService.reserve({
                ...form.values,
                voucher_address: $ctrl.voucher.address,
                product_id: $ctrl.product.id,
            }).then(
                (res) => {
                    if (res.data.checkout_url) {
                        return document.location = res.data.checkout_url;
                    }

                    $ctrl.setStep($ctrl.STEP_RESERVATION_FINISHED)
                },
                (err) => $ctrl.onError(err, false),
            );
        }, true);

        if ($ctrl.step <= $ctrl.STEP_SELECT_VOUCHER) {
            AuthService.identity().then((res) => {
                if (!res.data.email) {
                    $ctrl.step = $ctrl.STEP_EMAIL_SETUP;
                }
            });
        }

        $ctrl.mapFields($ctrl.product.reservation.fields?.map((field) => ({
            label: field.label,
            placeholder: field.label,
            description: field.description,
            custom: true,
            required: field.required,
            key: field.id,
            dusk: `customField${field.id}`,
            type: field.type,
        })) || [])
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
        'appConfigs',
        'AuthService',
        'VoucherService',
        'FormBuilderService',
        'PushNotificationsService',
        'ProductReservationService',
        ModalProductReserveComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-product-reserve.html',
};