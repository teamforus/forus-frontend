module.exports = ['PrintableRouteProvider', function(PrintableRouteProvider) {
    PrintableRouteProvider.printable('voucherQrCode', {
        component: 'printableVoucherQrCodeComponent'
    });
}];