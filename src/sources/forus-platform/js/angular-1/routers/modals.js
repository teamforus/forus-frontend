module.exports = ['ModalRouteProvider', function(ModalRouteProvider) {
    ModalRouteProvider.modal('photoUploader', {
        component: 'modalPhotoUploaderComponent'
    });

    ModalRouteProvider.modal('fundTopUp', {
        component: 'modalFundTopUpComponent'
    });

    ModalRouteProvider.modal('employeeEdit', {
        component: 'modalEmployeeEditComponent'
    });

    ModalRouteProvider.modal('modalNotification', {
        component: 'modalNotificationComponent'
    });

    ModalRouteProvider.modal('markdownCustomLink', {
        component: 'modalMarkdownCustomLinkComponent'
    });

    ModalRouteProvider.modal('modalPinCode', {
        component: 'modalPinCodeComponent'
    });

    ModalRouteProvider.modal('modalAuth', {
        component: 'modalAuthComponent'
    });

    ModalRouteProvider.modal('modalAuth2', {
        component: 'modalAuth2Component'
    });

    ModalRouteProvider.modal('voucher_create', {
        component: 'modalVoucherCreateComponent'
    });

    ModalRouteProvider.modal('product_voucher_create', {
        component: 'modalProductVoucherCreateComponent'
    });

    ModalRouteProvider.modal('voucher_qr_code', {
        component: 'modalVoucherQrCodeComponent'
    });

    ModalRouteProvider.modal('vouchersUpload', {
        component: 'modalVouchersUploadComponent'
    });

    ModalRouteProvider.modal('fundRequestRecordClarify', {
        component: 'modalFundRequestRecordClarifyComponent'
    });

    ModalRouteProvider.modal('fundRequestRecordDecline', {
        component: 'modalFundRequestRecordDeclineComponent'
    });
}];