const FundsSecurityComponent = function (
    $scope,
    FundService,
    FormBuilderService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;

    const auth2FARequiredOptions = [{
        value: 'global',
        name: 'Gebruik standaard instelling',
    }, {
        value: 'optional',
        name: 'Optioneel',
    }, {
        value: 'restrict_features',
        name: '2FA vereisen voor geselecteerde functies',
    }, {
        value: 'required',
        name: '2FA vereisen om in te loggen',
    }];

    const auth2FARememberIpOptions = [{
        value: false,
        name: 'Altijd bevestiging vereisen met 2FA',
    }, {
        value: true,
        name: 'Als IP-adres in de afgelopen 48 uur gebruikt, geen 2FA vereisen.',
    }];

    $ctrl.$onInit = () => {
        $ctrl.auth2FARequiredOptions = auth2FARequiredOptions;
        $ctrl.auth2FARememberIpOptions = auth2FARememberIpOptions;

        $ctrl.form = FormBuilderService.build({
            auth_2fa_policy: $ctrl.fund.auth_2fa_policy,
            auth_2fa_remember_ip: $ctrl.fund.auth_2fa_remember_ip,
            auth_2fa_restrict_emails: $ctrl.fund.auth_2fa_restrict_emails,
            auth_2fa_restrict_auth_sessions: $ctrl.fund.auth_2fa_restrict_auth_sessions,
            auth_2fa_restrict_reimbursements: $ctrl.fund.auth_2fa_restrict_reimbursements,
        }, (form) => {
            const { values } = form;

            PageLoadingBarService.setProgress(0);

            FundService.update($ctrl.organization.id, $ctrl.fund.id, values).then(() => {
                PushNotificationsService.success('Opgeslagen!');
            }, (e) => {
                PushNotificationsService.danger('Error!', e.data?.message || 'Onbekende foutmelding.');
                form.errors = e.data.errors;
            }).finally(() => form.unlock() & PageLoadingBarService.setProgress(100));
        }, true);

        $ctrl.global_2fa = Object.keys($ctrl.fund.organization_funds_2fa).reduce((obj, key) => {
            return { ...obj, [key.replace('auth_2fa_funds_', 'auth_2fa_')]: $ctrl.fund.organization_funds_2fa[key] }
        }, {});
    }
};

module.exports = {
    bindings: {
        fund: '<',
        organization: '<',
    },
    controller: [
        '$scope',
        'FundService',
        'FormBuilderService',
        'PageLoadingBarService',
        'PushNotificationsService',
        FundsSecurityComponent,
    ],
    templateUrl: 'assets/tpl/pages/funds-security.html',
};