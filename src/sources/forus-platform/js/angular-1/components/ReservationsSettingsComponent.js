const ReservationsSettingsComponent = function (
    $state,
    FormBuilderService,
    OrganizationService,
    PushNotificationsService,
) {
    const $ctrl = this;

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
        }, (form) => {
            OrganizationService.updateReservationFields($ctrl.organization.id, form.values).then(() => {
                PushNotificationsService.success('Opgeslagen!');
                $state.go('reservations', { organization_id: $ctrl.organization.id });
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
                PushNotificationsService.danger('Error!', res.data.message);
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
        '$state',
        'FormBuilderService',
        'OrganizationService',
        'PushNotificationsService',
        ReservationsSettingsComponent,
    ],
    templateUrl: 'assets/tpl/pages/reservations-settings.html',
};