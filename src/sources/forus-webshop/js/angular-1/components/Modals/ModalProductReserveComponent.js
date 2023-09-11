const ModalProductReserveComponent = function (
    $state,
    $filter,
    $timeout,
    appConfigs,
    AuthService,
    VoucherService,
    GoogleMapService,
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
    $ctrl.STEP_RESERVATION_FINISHED = 6;

    $ctrl.steps = [
        $ctrl.STEP_SELECT_VOUCHER,
        $ctrl.STEP_FILL_DATA,
        $ctrl.STEP_FILL_NOTES,
        $ctrl.STEP_CONFIRM_DATA,
    ];

    $ctrl.dateMinLimit = new Date();
    $ctrl.fields = [];
    $ctrl.step = $ctrl.STEP_SELECT_VOUCHER;

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

    let autocompleteAddressFrom;

    const fillInAddress = () => {
        const place = autocompleteAddressFrom.getPlace();

        const postal_code = GoogleMapService.getAddressComponent("postal_code", place)?.long_name || '';
        const street = GoogleMapService.getAddressComponent("route", place)?.short_name || '';
        const house_nr = GoogleMapService.getAddressComponent("street_number", place)?.long_name || '';
        const city = GoogleMapService.getAddressComponent("locality", place)?.long_name || '';
        
        $ctrl.form.values.city = city;
        $ctrl.form.values.street = street;
        $ctrl.form.values.house_nr = house_nr;
        $ctrl.form.values.postal_code = postal_code;

        $ctrl.form.values.address = `${street} ${house_nr}, ${postal_code}, ${city}`;
    }

    const addMapAutocomplete = () => {
        let autocompleteOptions = GoogleMapService.getAutocompleteOptions();

        autocompleteAddressFrom = new google.maps.places.Autocomplete(
            angular.element(document.getElementById('reservation-address'))[0],
            autocompleteOptions
        );

        google.maps.event.addListener(autocompleteAddressFrom, 'place_changed', fillInAddress);
    }

    $ctrl.validateClient = () => {
        ProductReservationService.validateClient({
            ...$ctrl.form.values,
            voucher_address: $ctrl.voucher.address,
            product_id: $ctrl.product.id,
        }).then(() => {
            $ctrl.form.errors = {};
            $ctrl.setStep($ctrl.step + 1);

            $timeout(() => addMapAutocomplete(), 0);
        }, $ctrl.onError);
    };

    $ctrl.validateAddress = () => {
        ProductReservationService.validateAddress({
            address: $ctrl.form.values.postal_code ? $ctrl.form.values.address : null,
            street: $ctrl.form.values.street,
            house_nr: $ctrl.form.values.house_nr,
            city: $ctrl.form.values.city,
            postal_code: $ctrl.form.values.postal_code,
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
            $ctrl.addressRequired = true;
            $ctrl.steps.splice($ctrl.steps.indexOf($ctrl.STEP_FILL_DATA), 0, $ctrl.STEP_FILL_ADDRESS);
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
            $ctrl.validateClient();
        } else if ($ctrl.step == $ctrl.STEP_FILL_ADDRESS) {
            $ctrl.validateAddress();
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
        '$timeout',
        'appConfigs',
        'AuthService',
        'VoucherService',
        'GoogleMapService',
        'FormBuilderService',
        'PushNotificationsService',
        'ProductReservationService',
        ModalProductReserveComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-product-reserve.html',
};