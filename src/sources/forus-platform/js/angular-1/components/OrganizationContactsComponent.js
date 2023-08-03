const OrganizationContactsComponent = function (
    FormBuilderService,
    OrganizationService,
    PushNotificationsService,
) {
    const $ctrl = this;

    const available = [{
        key: 'fund_balance_low',
        type: 'email',
    }, {
        key: 'bank_connections_expiring',
        type: 'email',
    }, {
        key: 'provider_applied',
        type: 'email',
    }];

    $ctrl.initForm = () => {
        const contacts = available.map((type) => ({
            ...type, 
            ...$ctrl.organization.contacts.find((contact) => contact.key === type.key),
        }));

        $ctrl.form = FormBuilderService.build({ contacts }, (form) => {
            OrganizationService.update($ctrl.organization.id, form.values).then((res) => {
                $ctrl.organization = res.data.data;
                $ctrl.initForm();
                PushNotificationsService.success('Opgeslagen!');
            }, (res) => {
                form.errors = res.data.errors;
                PushNotificationsService.danger(res.data?.message || 'Onbekende foutmelding!');
            }).finally(() => form.unlock());
        }, true);
    };

    $ctrl.$onInit = function () {
        $ctrl.initForm();
    };
};

module.exports = {
    bindings: {
        organization: '<',
    },
    controller: [
        'FormBuilderService',
        'OrganizationService',
        'PushNotificationsService',
        OrganizationContactsComponent,
    ],
    templateUrl: 'assets/tpl/pages/organization-contacts.html',
};