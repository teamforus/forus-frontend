const OrganizationContactsComponent = function (
    FormBuilderService,
    PushNotificationsService,
    OrganizationContactService
) {
    const $ctrl = this;

    $ctrl.initForm = () => {
        let list = [];

        for (const key in $ctrl.available) {
            const contact = $ctrl.contacts.filter((contact) => contact.contact_key === key)[0];
            if (contact) {
                list.push(contact);
            } else {
                list.push({
                    contact_key: key,
                    type: $ctrl.available[key],
                    value: null
                });
            }
        }

        $ctrl.form = FormBuilderService.build({contacts: list}, (form) => {
            OrganizationContactService.store(
                $ctrl.organization.id,
                form.values,
            ).then((res) => {
                $ctrl.contacts = res.data.data;
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
        contacts: '<',
        available: '<',
    },
    controller: [
        'FormBuilderService',
        'PushNotificationsService',
        'OrganizationContactService',
        OrganizationContactsComponent,
    ],
    templateUrl: 'assets/tpl/pages/organization-contacts.html',
};