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

    const buildForm = (fields = []) => {
        $ctrl.form = FormBuilderService.build({
            fields,
            reservation_phone: $ctrl.organization.reservation_phone,
            reservation_address: $ctrl.organization.reservation_address,
            reservation_birth_date: $ctrl.organization.reservation_birth_date,
        }, (form) => {
            OrganizationService.updateReservationFields($ctrl.organization.id, form.values).then(() => {
                PushNotificationsService.success('Opgeslagen!');
                loadFieldsAndForm();
                form.errors = null;
            }, (res) => {
                form.errors = res.data.errors;
                PushNotificationsService.danger('Error!', res.data.message);
            }).finally(() => form.unlock());
        }, true);
    }

    const loadFieldsAndForm = () => {
        if ($ctrl.organization.allow_reservation_custom_fields) {
            OrganizationService.reservationFields($ctrl.organization.id).then(
                (res) => buildForm(res.data.data),
                (res) => PushNotificationsService.danger('Error!', res.data.message)
            );
        } else {
            buildForm();
        }
    }

    $ctrl.$onInit = function () {
        loadFieldsAndForm();
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