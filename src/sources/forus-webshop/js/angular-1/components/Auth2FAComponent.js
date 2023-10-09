const Auth2FAComponent = function (
    $state,
    $rootScope,
    ModalService,
) {
    const $ctrl = this;

    $ctrl.goDashboard = () => {
        $rootScope.$broadcast('auth:update');
        $state.go('home');
    };

    $ctrl.auth2FA = (type, auth = false) => {
        $ctrl.hidePane = true;

        ModalService.open('2FASetup', {
            ...{ auth, type },
            auth2FAState: $ctrl.auth2FAState,
            onCancel: () => $ctrl.hidePane = false,
            onReady: () => document.location.reload(),
        });
    };

    $ctrl.$onInit = () => {
        const { required, confirmed, active_providers, provider_types } = $ctrl.auth2FAState;

        $ctrl.hidePane = false;
        $ctrl.provider_types = provider_types;
        $ctrl.active_providers = active_providers;

        if (!required || confirmed) {
            return $ctrl.goDashboard();
        }

        if (active_providers.length == 0) {
            $ctrl.step = 'setup';
            $ctrl.provider_types = provider_types;
        }

        if (active_providers.length > 0) {
            $ctrl.step = 'auth';
            $ctrl.provider_types = provider_types.filter((provider_type) => {
                return active_providers.map((auth_2fa) => auth_2fa.provider_type.type).includes(provider_type.type);
            });
        }
    };
};

module.exports = {
    bindings: {
        auth2FAState: '<',
    },
    controller: [
        '$state',
        '$rootScope',
        'ModalService',
        Auth2FAComponent,
    ],
    templateUrl: 'assets/tpl/pages/auth-2fa.html',
};
