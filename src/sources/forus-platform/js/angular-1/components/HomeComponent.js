let HomeComponent = function(
    $state,
    $stateParams,
    ModalService,
    IdentityService,
    CredentialsService,
    PushNotificationsService
) {
    let $ctrl = this;
    let qrCodeEl = document.getElementById('qrcode');
    let $redirectAuthorizedState = 'organizations';

    $ctrl.showModal = false;

    $ctrl.openAuthPopup = function() {
        ModalService.open('modalAuth', {});
    };

    if (!!CredentialsService.get()) {
        IdentityService.identity().then(() => {}, $state.go($redirectAuthorizedState));
    }

    $ctrl.closeModal = function() {
        $ctrl.showModal = false;
        qrCodeEl.innerHTML = '';
    };

    $ctrl.cleanReload = () => {
        $state.go($state.current.name, {
            digid_success: null,
            digid_error: null,
        });
    };

    $ctrl.$onInit = () => {
        if ($stateParams.digid_error == 'uid_not_found') {
            PushNotificationsService.danger(
                "Unknown BSN number.",
            ) & $ctrl.cleanReload();
        } else if ($stateParams.digid_error != null) {
            PushNotificationsService.danger(
                "Something went wrong",
                "Could not login by DigiD, unknown issue occurred.",
            ) & $ctrl.cleanReload();
        }
    };
};

module.exports = {
    controller: [
        '$state',
        '$stateParams',
        'ModalService',
        'IdentityService',
        'CredentialsService',
        'PushNotificationsService',
        HomeComponent
    ],
    templateUrl: ['appConfigs', (appConfigs) => {
        if (appConfigs.panel_type == 'validator') {
            return 'assets/tpl/pages/home.html';
        }

        if (appConfigs.panel_type == 'provider' && appConfigs.client_key == 'nijmegen') {
            return 'assets/tpl/pages/landing/home-' + appConfigs.panel_type + '-' + appConfigs.client_key + '.html';
        }

        if (appConfigs.panel_type == 'sponsor' && appConfigs.client_key == 'nijmegen') {
            return 'assets/tpl/pages/landing/home-' + appConfigs.panel_type + '-' + appConfigs.client_key + '.html';
        }

        return 'assets/tpl/pages/landing/home-' + appConfigs.panel_type + '.html';
    }]
};