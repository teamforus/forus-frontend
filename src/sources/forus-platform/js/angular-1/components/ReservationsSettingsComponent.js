const ReservationsSettingsComponent = function (
    FormBuilderService,
    OrganizationService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.fields = [];
    $ctrl.fieldsErrors = null;

    $ctrl.reservationFieldOptions = [{
        value: "no",
        label: "Nee",
    }, {
        value: "optional",
        label: "Optioneel",
    }, {
        value: "required",
        label: "Verplicht",
    }];

    $ctrl.extraPaymentsOptions = [{
        value: false,
        label: "No",
    }, {
        value: true,
        label: "Yes",
    }];

    const buildForm = (fields = []) => {
        $ctrl.form = FormBuilderService.build({
            fields,
            reservation_phone: $ctrl.organization.reservation_phone,
            reservation_address: $ctrl.organization.reservation_address,
            reservation_birth_date: $ctrl.organization.reservation_birth_date,
            reservation_allow_extra_payments: $ctrl.organization.reservation_allow_extra_payments
        }, (form) => {
            OrganizationService.updateReservationFields($ctrl.organization.id, form.values).then((res) => {
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.organization = res.data.data;
                buildForm($ctrl.organization.reservation_fields);
                form.errors = null;
            }, (res) => {
                form.errors = res.data.errors;
                PushNotificationsService.danger('Error!', res.data.message);
            }).finally(() => form.unlock());
        }, true);
    }

    $ctrl.$onInit = function () {
        buildForm($ctrl.organization.reservation_fields);
    }
};

module.exports = {
    bindings: {
        organization: '<',
    },
    controller: [
        'FormBuilderService',
        'OrganizationService',
        'PushNotificationsService',
        ReservationsSettingsComponent,
    ],
    templateUrl: 'assets/tpl/pages/reservations-settings.html',
};