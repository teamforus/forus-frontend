let VoucherComponent = function(
    VoucherService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        let qrCodeEl = document.getElementById('voucher_qr');

        new QRCode(qrCodeEl, {
            text: JSON.stringify({
                type: 'voucher',
                value: $ctrl.voucher.address
            }),
            correctLevel: QRCode.CorrectLevel.L
        });

        qrCodeEl.removeAttribute('title');;

        $ctrl.voucherCard = VoucherService.composeCardData($ctrl.voucher);
    };
};

module.exports = {
    bindings: {
        voucher: '<'
    },
    controller: [
        'VoucherService',
        VoucherComponent
    ],
    templateUrl: 'assets/tpl/pages/voucher.html'
};