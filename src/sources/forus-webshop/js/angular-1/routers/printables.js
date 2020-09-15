module.exports = ['PrintableRouteProvider', function(
    PrintableRouteProvider
) {
    PrintableRouteProvider.printable('voucherQrCode', {
        component: 'printableVoucherQrCodeComponent'
    });

    PrintableRouteProvider.printable('physicalCardCode', {
        component: 'physicalCardCodeComponent'
    });
}];