let VoucherComponent = function(
    $filter,
    $state,
    VoucherService,
    PrintableService,
    ModalService
) {
    let $ctrl = this;
    $ctrl.qrValue = null;

    $ctrl.$onInit = function() {
        
        $ctrl.qrValue = $ctrl.voucher.address;
        $ctrl.voucherCard = VoucherService.composeCardData($ctrl.voucher);
        $ctrl.qrCodeValue = $ctrl.voucher.address;

        $ctrl.deleteVoucher = function(voucher) {

            ModalService.open('modalNotification', {
                type: 'confirm',
                title: 'Annuleer reservering',
                icon: 'voucher_apply',
                description: $filter('translate')('voucher.delete_voucher.popup_form.description'),
                confirmBtnText: $filter('translate')('voucher.delete_voucher.buttons.submit'),
                cancelBtnText: $filter('translate')('voucher.delete_voucher.buttons.close'),
                confirm: () => {
                    VoucherService.destroy(
                        voucher.address
                    ).then(function(res) {
                        $state.go('vouchers')
                    })
                }
            })
        }

        $ctrl.printQrCode = () => {
            PrintableService.open('voucherQrCode', {
                voucher: $ctrl.voucher,
                organization: $ctrl.organization,
            });
        }

        $ctrl.sendVoucherEmail = function(voucher) {
            return ModalService.open('modalNotification', {
                type: 'confirm',
                title: "E-Mail voucher naar uzelf",
                description: "U kunt uw voucher naar uzelf mailen. Laat de voucher, in de vorm van een QR-code, aan de aanbieder zien vanuit uw vertrouwde e-mailbox.",
                confirm: () => {
                    VoucherService.sendToEmail(voucher.address).then(res => {
                        ModalService.open('modalNotification', {
                            type: 'action-result',
                            class: 'modal-description-pad',
                            title: $filter('translate')('popup_auth.labels.voucher_email'),
                            description: $filter('translate')('popup_auth.notifications.voucher_email'),
                            confirmBtnText: $filter('translate')('popup_auth.buttons.confirm')
                        });
                    });
                }
            });
        };

        $ctrl.openInMeModal = () => {
            return ModalService.open('modalOpenInMe', {});
        };

        $ctrl.shareVoucher = function(voucher) {
            return ModalService.open('modalShareVoucher', {
                voucher: voucher
            });
        };
    };
};

module.exports = {
    bindings: {
        voucher: '<'
    },
    controller: [
        '$filter',
        '$state',
        'VoucherService',
        'PrintableService',
        'ModalService',
        VoucherComponent
    ],
    templateUrl: 'assets/tpl/pages/voucher.html'
};
