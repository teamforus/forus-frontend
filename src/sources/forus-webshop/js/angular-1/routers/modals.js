module.exports = ['ModalRouteProvider', function(
    ModalRouteProvider
) {
    ModalRouteProvider.modal('modalNotification', {
        component: 'modalNotificationComponent'
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

    ModalRouteProvider.modal('modalProductReserve', {
        component: 'modalProductReserveComponent'
    });

    ModalRouteProvider.modal('modalProductReserveCancel', {
        component: 'modalProductReserveCancelComponent'
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

    ModalRouteProvider.modal('photoCropper', {
        component: 'modalPhotoCropperComponent'
    });

    ModalRouteProvider.modal('modalReimbursementConfirm', {
        component: 'modalReimbursementConfirmComponent'
    });

    ModalRouteProvider.modal('deactivateVoucher', {
        component: 'modalDeactivateVoucherComponent'
    });

    ModalRouteProvider.modal('2FASetup', {
        component: 'modal2FASetupComponent'
    });

    ModalRouteProvider.modal('2FADeactivate', {
        component: 'modal2FADeactivateComponent'
    });
}];