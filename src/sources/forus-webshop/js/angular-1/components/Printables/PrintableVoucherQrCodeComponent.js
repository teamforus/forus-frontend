let PrintableVoucherQrCodeComponent = function(
    $timeout,
    appConfigs,
) {
    let $ctrl = this;

    $ctrl.qrCodeValue = null;

    $ctrl.$onInit = () => {
        $ctrl.voucher = $ctrl.printable.scope.voucher;
        $ctrl.voucherType = $ctrl.voucher.product ? 'product' : 'budget';
        
        $ctrl.printableTitle = $ctrl.voucher.product ? 
            $ctrl.voucher.product.name : $ctrl.voucher.fund.name;

        $ctrl.organization = $ctrl.printable.scope.organization;

        $ctrl.organization = $ctrl.printable.scope.organization;
        $ctrl.url_webshop = appConfigs.features.fronts.url_webshop;
        $ctrl.qrCodeValue = $ctrl.voucher.address;

        $timeout(() => {
            window.print();
            $ctrl.close();
        }, 500);
    };

    $ctrl.$onDestroy = function() {};
};

module.exports = {
    bindings: {
        close: '=',
        printable: '=',
    },
    controller: [
        '$timeout',
        'appConfigs',
        PrintableVoucherQrCodeComponent
    ],
    templateUrl: () => {
        return '/assets/tpl/printables/printable-voucher-qr_code.html';
    }
};