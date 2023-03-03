const ReservationsSettingsComponent = function (
    FormBuilderService,
    OrganizationService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.reservationFieldOptions = [{
        value: "no",
        label: "Nee"
    }, {
        value: "optional",
        label: "Optioneel"
    }, {
        value: "required",
        label: "Verplicht"
    }];

    const buildForm = () => {
        $ctrl.form = FormBuilderService.build({
            reservation_requester_birth_date: $ctrl.organization.reservation_requester_birth_date,
            reservation_address:   $ctrl.organization.reservation_address,
            reservation_phone:     $ctrl.organization.reservation_phone,
        }, (form) => {
            OrganizationService.updateReservationFields($ctrl.organization.id, form.values).then((res) => {
                PushNotificationsService.success('Opgeslagen!');
            }, (err) => {
                form.errors = res.data.errors;
                form.unlock();
            });
        });
    }

    $ctrl.$onInit = function () {
        buildForm();
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