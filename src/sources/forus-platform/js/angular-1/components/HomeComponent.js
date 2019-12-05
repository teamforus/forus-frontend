let HomeComponent = function(
    $state,
    CredentialsService,
    IdentityService,
    ModalService
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
};

module.exports = {
    controller: [
        '$state',
        'CredentialsService',
        'IdentityService',
        'ModalService',
        HomeComponent
    ],
    templateUrl: ['appConfigs', (appConfigs) => {
        if (appConfigs.panel_type == 'validator') {
            return 'assets/tpl/pages/home.html';
        }

        if (appConfigs.panel_type == 'provider'  && (appConfigs.client_key == 'nijmegen' || appConfigs.client_key == 'noordoostpolder')){
            return 'assets/tpl/pages/landing/home-' + appConfigs.panel_type + '-'+ appConfigs.client_key +'.html';
        }

        if (appConfigs.panel_type == 'sponsor' && (appConfigs.client_key == 'nijmegen' || appConfigs.client_key == 'noordoostpolder')){
            return 'assets/tpl/pages/landing/home-' + appConfigs.panel_type + '-'+ appConfigs.client_key +'.html';
        }

        return 'assets/tpl/pages/landing/home-' + appConfigs.panel_type + '.html';
    }]
};