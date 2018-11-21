module.exports = ['ModalRouteProvider', function(ModalRouteProvider) {
    ModalRouteProvider.modal('photoUploader', {
        component: 'modalPhotoUploaderComponent'
    });

    ModalRouteProvider.modal('fundTopUp', {
        component: 'modalFundTopUpComponent'
    });

    ModalRouteProvider.modal('modalNotification', {
        component: 'modalNotificationComponent'
    });
}];