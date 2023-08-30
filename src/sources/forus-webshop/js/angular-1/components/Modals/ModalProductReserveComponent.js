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
    $ctrl.STEP_FILL_NOTES = 3;
    $ctrl.STEP_CONFIRM_DATA = 4;
    $ctrl.STEP_RESERVATION_FINISHED = 5;

    $ctrl.steps = [
        $ctrl.STEP_SELECT_VOUCHER,
        $ctrl.STEP_FILL_DATA,
        $ctrl.STEP_FILL_NOTES,
        $ctrl.STEP_CONFIRM_DATA,
    ];

    $ctrl.dateMinLimit = new Date();
    $ctrl.fields = [];
    $ctrl.step = $ctrl.STEP_SELECT_VOUCHER;
    $ctrl.emptyText = $trans('confirm_notes.labels.empty');

    $ctrl.finish = () => {
        $ctrl.close();
        $state.go('reservations');
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
            $ctrl.setStep($ctrl.step + 1);
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

    $ctrl.addEmail = () => {
        $state.go('identity-emails');
        $ctrl.close();
    };

    $ctrl.setStep = (step) => {
        $ctrl.step = step;
    };

    $ctrl.back = () => {
        $ctrl.setStep($ctrl.step - 1);
    };

    $ctrl.next = () => {
        if ($ctrl.step == $ctrl.STEP_FILL_DATA) {
            $ctrl.productReserve();
        } else {
            $ctrl.setStep($ctrl.step + 1);
        }
    };

    $ctrl.selectVoucher = (voucher) => {
        $ctrl.voucher = voucher;
        $ctrl.next();
    };

    $ctrl.$onInit = () => {
        $ctrl.appConfigs = appConfigs;
        $ctrl.emailSetupShow = false;
        $ctrl.emailSubmitted = false;
        $ctrl.emailShowForm = false;

        $ctrl.product = $ctrl.modal.scope.product;
        $ctrl.provider = $ctrl.product.organization;
        $ctrl.vouchers = $ctrl.modal.scope.vouchers.map((voucher) => VoucherService.composeCardData({ ...voucher }));

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
            }).then($ctrl.next(), $ctrl.onError);
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