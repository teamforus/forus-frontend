module.exports = ['ModalRouteProvider', function(ModalRouteProvider) {
    ModalRouteProvider.modal('2FASetup', {
        component: 'modal2FASetupComponent'
    });

    ModalRouteProvider.modal('2FADeactivate', {
        component: 'modal2FADeactivateComponent'
    });
}];