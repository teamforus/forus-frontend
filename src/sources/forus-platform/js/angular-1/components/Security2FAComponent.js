const Security2FAComponent = function (
    $rootScope,
    ModalService,
    FormBuilderService,
    Identity2FAService,
    PushNotificationsService,
) {
    const $ctrl = this;

    const auth2FARememberIpOptions = [{
        value: 0,
        name: 'Altijd bevestiging vereisen met 2FA',
    }, {
        value: 1,
        name: 'Als IP-adres in de afgelopen 48 uur gebruikt, geen 2FA vereisen.',
    }];

    $ctrl.updateState = () => {
        Identity2FAService.status().then((res) => {
            $rootScope.$broadcast('auth:update');

            $ctrl.auth2FAState = res.data.data;
            $ctrl.$onInit();
        });
    }

    $ctrl.setupAuth2FA = (type) => {
        ModalService.open('2FASetup', {
            ...{ type },
            auth2FAState: $ctrl.auth2FAState,
            onReady: () => $ctrl.updateState(),
        });
    };

    $ctrl.deactivateAuth2FA = (type) => {
        ModalService.open('2FADeactivate', {
            auth2fa: $ctrl.active_providers.find((auth_2fa) => auth_2fa.provider_type.type == type),
            onReady: () => $ctrl.updateState(),
        });
    };

    $ctrl.$onInit = () => {
        const { active_providers, providers, provider_types, restrictions } = $ctrl.auth2FAState;

        $ctrl.loaded = true;
        $ctrl.restrictions = restrictions;
        $ctrl.active_providers = active_providers;
        $ctrl.providers = providers;
        $ctrl.provider_types = provider_types;
        $ctrl.active_provider_types = active_providers.map((auth_2fa) => auth_2fa.provider_type.type);

        $ctrl.active_providers_by_key = $ctrl.active_providers.reduce((list, item) => ({ 
            ...list, 
            [item.provider_type.type]: active_providers.find((auth_2fa) => auth_2fa.provider_type.type == item.provider_type.type),
        }), {});

        $ctrl.auth2FARememberIpOptions = auth2FARememberIpOptions;

        $ctrl.form = FormBuilderService.build({
            auth_2fa_remember_ip: $ctrl.auth2FAState.auth_2fa_remember_ip ? 1 : 0,
        }, (form) => {
            Identity2FAService.update(form.values).then((res) => {
                $ctrl.auth2FAState = res.data.data;
                PushNotificationsService.success('Opgeslagen!');
            }, (res) => {
                form.errors = res.data.errors;
                PushNotificationsService.danger('Error', res.data?.message || 'Onbekende foutmelding.');
            }).finally(() => form.unlock());
        }, true);
    };
}

module.exports = {
    bindings: {
        auth2FAState: '<',
    },
    controller: [
        '$rootScope',
        'ModalService',
        'FormBuilderService',
        'Identity2FAService',
        'PushNotificationsService',
        Security2FAComponent,
    ],
    templateUrl: 'assets/tpl/pages/security/2fa.html',
};