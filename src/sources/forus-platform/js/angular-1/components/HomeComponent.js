let HomeComponent = function(
    $state, 
    CredentialsService, 
    IdentityService,
    ModalService,
    appConfigs
) {
    let $ctrl = this;
    let qrCodeEl = document.getElementById('qrcode');

    let $redirectAuthorizedState = 'organizations';

    if (appConfigs.panel_type == 'validator') {
        $redirectAuthorizedState = 'csv-validation';
    }

    $ctrl.showModal = false;

    $ctrl.openAuthPopup = function () {
        ModalService.open('modalAuth', {});
    };

    if (!!CredentialsService.get()) {
        IdentityService.identity().then(() => { }, $state.go($redirectAuthorizedState));
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
        'appConfigs', 
        HomeComponent
    ],
    templateUrl: (appConfigs) => {
        if (appConfigs.panel_type == 'validator') {
            return 'assets/tpl/pages/home.html';
        }
        if (appConfigs.panel_type == 'provider'  && appConfigs.client_key == 'nijmegen'){
            return 'assets/tpl/pages/landing/home-' + appConfigs.panel_type + '-'+ appConfigs.client_key +'.html';
        }
        if (appConfigs.panel_type == 'sponsor' && appConfigs.client_key == 'nijmegen'){
            return 'assets/tpl/pages/landing/home-' + appConfigs.panel_type + '-'+ appConfigs.client_key +'.html';
        }
        return 'assets/tpl/pages/landing/home-' + appConfigs.panel_type + '.html';
    }
};