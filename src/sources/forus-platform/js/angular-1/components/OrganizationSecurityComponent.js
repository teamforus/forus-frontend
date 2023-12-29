const OrganizationSecurityComponent = function (
    $rootScope,
    $stateParams,
    FormBuilderService,
    OrganizationService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;

    const auth2FARequiredOptions = [{
        value: 'optional',
        name: 'Optioneel',
    }, {
        value: 'required',
        name: 'Verplicht',
    }];

    const auth2FARememberIpOptions = [{
        value: 0,
        name: 'Altijd bevestiging vereisen met 2FA',
    }, {
        value: 1,
        name: 'Als IP-adres in de afgelopen 48 uur gebruikt, geen 2FA vereisen.',
    }];

    const auth2FAFundsRequiredOptions = [{
        value: 'optional',
        name: 'Optioneel',
    }, {
        value: 'restrict_features',
        name: '2FA vereisen voor geselecteerde functies',
    }, {
        value: 'required',
        name: '2FA vereisen om in te loggen',
    }];

    $ctrl.viewType = $stateParams.view_type || 'employees';

    $ctrl.$onInit = () => {
        $ctrl.auth2FARequiredOptions = auth2FARequiredOptions;
        $ctrl.auth2FAFundsRequiredOptions = auth2FAFundsRequiredOptions;
        $ctrl.auth2FARememberIpOptions = auth2FARememberIpOptions;

        $ctrl.form = FormBuilderService.build({
            auth_2fa_policy: $ctrl.organization.auth_2fa_policy,
            auth_2fa_remember_ip: $ctrl.organization.auth_2fa_remember_ip ? 1 : 0,
            auth_2fa_funds_policy: $ctrl.organization.auth_2fa_funds_policy,
            auth_2fa_funds_remember_ip: $ctrl.organization.auth_2fa_funds_remember_ip ? 1 : 0,
            auth_2fa_restrict_bi_tools: $ctrl.organization.auth_2fa_restrict_bi_tools,
            auth_2fa_funds_restrict_emails: $ctrl.organization.auth_2fa_funds_restrict_emails,
            auth_2fa_funds_restrict_auth_sessions: $ctrl.organization.auth_2fa_funds_restrict_auth_sessions,
            auth_2fa_funds_restrict_reimbursements: $ctrl.organization.auth_2fa_funds_restrict_reimbursements,
        }, (form) => {
            PageLoadingBarService.setProgress(0);

            OrganizationService.update($ctrl.organization.id, form.values).then((e) => {
                PushNotificationsService.success('Opgeslagen!');
                $rootScope.$broadcast('auth:update')
            }, (e) => {
                PushNotificationsService.danger('Error!', e.data?.message || 'Onbekende foutmelding.');
                form.errors = e.data.errors;
            }).finally(() => form.unlock() & PageLoadingBarService.setProgress(100));
        }, true);
    }
};

module.exports = {
    bindings: {
        organization: '<',
    },
    controller: [
        '$rootScope',
        '$stateParams',
        'FormBuilderService',
        'OrganizationService',
        'PageLoadingBarService',
        'PushNotificationsService',
        OrganizationSecurityComponent,
    ],
    templateUrl: 'assets/tpl/pages/organization-security.html',
};