module.exports = ['ModalRouteProvider', function(
    ModalRouteProvider
) {
    ModalRouteProvider.modal('modalNotification', {
        component: 'modalNotificationComponent'
    });

    ModalRouteProvider.modal('modalOffices', {
        component: 'modalOfficesComponent'
    });

    ModalRouteProvider.modal('modalAuth', {
        component: 'modalAuthComponent'
    });

    ModalRouteProvider.modal('modalPinCode', {
        component: 'modalPinCodeComponent'
    });

    ModalRouteProvider.modal('modalAuthCode', {
        component: 'modalAuthCodeComponent'
    });

    ModalRouteProvider.modal('modalShareVoucher', {
        component: 'modalShareVoucherComponent'
    });

    ModalRouteProvider.modal('modalOpenInMe', {
        component: 'modalOpenInMeComponent'
    });

    ModalRouteProvider.modal('modalProductApply', {
        component: 'modalProductApplyComponent'
    });
    
    ModalRouteProvider.modal('identityProxyExpired', {
        component: 'modalIdentityProxyExpiredComponent'
    });
    
    ModalRouteProvider.modal('modalPhysicalCardType', {
        component: 'modalPhysicalCardTypeComponent'
    });
    
    ModalRouteProvider.modal('modalPhysicalCardUnlink', {
        component: 'modalPhysicalCardUnlinkComponent'
    });

    ModalRouteProvider.modal('pdfPreview', {
        component: 'modalPdfPreviewComponent'
    });

    ModalRouteProvider.modal('imagePreview', {
        component: 'modalImagePreviewComponent'
    });
}];