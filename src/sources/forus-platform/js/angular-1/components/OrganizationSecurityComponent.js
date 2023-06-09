const OrganizationSecurityComponent = function (
    $rootScope,
    FormBuilderService,
    OrganizationService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;

    const auth2FARequiredOptions = [{
        value: 'optional',
        name: 'Optional',
    }, {
        value: 'required',
        name: 'Required',
    }];

    const auth2FARememberIpOptions = [{
        value: 0,
        name: 'Always require confirmation',
    }, {
        value: 1,
        name: 'Do not require confirmation when IP was already used with 2FA in last 48 hours.',
    }];

    $ctrl.$onInit = () => {
        $ctrl.auth2FARequiredOptions = auth2FARequiredOptions;
        $ctrl.auth2FARememberIpOptions = auth2FARememberIpOptions;

        $ctrl.form = FormBuilderService.build({
            auth_2fa_policy: $ctrl.organization.auth_2fa_policy,
            auth_2fa_remember_ip: $ctrl.organization.auth_2fa_remember_ip ? 1 : 0,
        }, (form) => {
            PageLoadingBarService.setProgress(0);

            OrganizationService.update($ctrl.organization.id, form.values).then((e) => {
                PushNotificationsService.success('Updated!');
                $rootScope.$broadcast('auth:update')
            }, (e) => {
                PushNotificationsService.danger('Error!', e.data?.message || 'Unknown error.');
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
        'FormBuilderService',
        'OrganizationService',
        'PageLoadingBarService',
        'PushNotificationsService',
        OrganizationSecurityComponent,
    ],
    templateUrl: 'assets/tpl/pages/organization-security.html',
};