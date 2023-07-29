const ReservationsSettingsComponent = function (
    $state,
    FormBuilderService,
    OrganizationService,
    PushNotificationsService,
    OrganizationReservationFieldService,
) {
    const $ctrl = this;
    $ctrl.fieldsErrors = null;
    $ctrl.fields = [];

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

    const buildForm = () => {
        $ctrl.form = FormBuilderService.build({
            reservation_phone: $ctrl.organization.reservation_phone,
            reservation_address: $ctrl.organization.reservation_address,
            reservation_birth_date: $ctrl.organization.reservation_birth_date,
            fields: $ctrl.fields
        }, (form) => {
            OrganizationService.updateReservationFields($ctrl.organization.id, form.values).then(() => {
                PushNotificationsService.success('Opgeslagen!');
                loadFieldsAndForm();
                $ctrl.fieldsErrors = null;
            }, (res) => {
                form.errors = res.data.errors;
                $ctrl.fieldsErrors = res.data.errors;

                form.unlock();
                PushNotificationsService.danger('Error!', res.data.message);
            });
        });
    }

    const loadFieldsAndForm = () => {
        if ($ctrl.organization.allow_reservation_custom_fields) {
            OrganizationReservationFieldService.list($ctrl.organization.id).then((res) => {
                $ctrl.fields = res.data.data;
                buildForm();
            });
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
        '$state',
        'FormBuilderService',
        'OrganizationService',
        'PushNotificationsService',
        'OrganizationReservationFieldService',
        ReservationsSettingsComponent,
    ],
    templateUrl: 'assets/tpl/pages/reservations-settings.html',
};