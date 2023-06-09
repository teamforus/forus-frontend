const FundsSecurityComponent = function (
    FundService,
    FormBuilderService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;

    const auth2FARequiredOptions = [{
        value: 'optional',
        name: 'Optional',
    }, {
        value: 'restrict_features',
        name: 'Require 2FA for selected features',
    }, {
        value: 'required',
        name: 'Require 2FA for sign-in',
    }];

    const auth2FARememberIpOptions = [{
        value: false,
        name: 'Always require confirmation',
    }, {
        value: true,
        name: 'Do not require confirmation when IP was already used with 2FA in last 48 hours.',
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
                PushNotificationsService.success('Updated!');
            }, (e) => {
                PushNotificationsService.danger('Error!', e.data?.message || 'Unknown error.');
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