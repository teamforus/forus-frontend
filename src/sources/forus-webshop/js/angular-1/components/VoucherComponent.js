let VoucherComponent = function(
    $filter,
    $element,
    VoucherService,
    ModalService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        $element.find('.card-qr_code-element').each(function() {
            let qrCodeEl = this;

            new QRCode(qrCodeEl, {
                text: JSON.stringify({
                    type: 'voucher',
                    value: $ctrl.voucher.address
                }),
                colorLight: 'transparent', 
                correctLevel: QRCode.CorrectLevel.L
            });

            qrCodeEl.removeAttribute('title');
        });

        $ctrl.voucherCard = VoucherService.composeCardData($ctrl.voucher);

        $ctrl.printQrCode = () => {
            let body = angular.element('body');
            let bodyElements = angular.element('body>*');
            let printContents = $element.find('.card-qr_code-element').first().clone();
            
            printContents.addClass('printable-qr_code');
            bodyElements.css('display', 'none');
            body.append(printContents);
            window.print();
            bodyElements.css('display', '');
            printContents.remove();
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
        '$element',
        'VoucherService',
        'ModalService',
        VoucherComponent
    ],
    templateUrl: 'assets/tpl/pages/voucher.html'
};
