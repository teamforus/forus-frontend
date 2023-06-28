const FundsSecurityComponent = function (
    FundService,
    FormBuilderService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;

    const auth2FARequiredOptions = [{
        value: 'optional',
        name: 'Optioneel',
    }, {
        value: 'restrict_features',
        name: 'tweefactorauthenticatie vereisen voor geselecteerde functies',
    }, {
        value: 'required',
        name: 'tweefactorauthenticatie vereisen om in te loggen',
    }];

    const auth2FARememberIpOptions = [{
        value: false,
        name: 'Altijd bevestiging vereisen met tweefactorauthenticatie',
    }, {
        value: true,
        name: 'Geen tweefactorauthenticatie-bevestiging vereisen wanneer IP adres binnen de laatste 48 uur is gebruikt.',
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
    }
};

module.exports = {
    bindings: {
        fund: '<',
        organization: '<',
    },
    controller: [
        'FundService',
        'FormBuilderService',
        'PageLoadingBarService',
        'PushNotificationsService',
        FundsSecurityComponent,
    ],
    templateUrl: 'assets/tpl/pages/funds-security.html',
};