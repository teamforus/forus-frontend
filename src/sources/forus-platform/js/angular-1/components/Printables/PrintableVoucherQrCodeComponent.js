let PrintableVoucherQrCodeComponent = function($timeout) {
    let $ctrl = this;

    $ctrl.qrCodeValue = null;

    $ctrl.$onInit = () => {
        $ctrl.voucher = $ctrl.printable.scope.voucher;
        $ctrl.fund = $ctrl.printable.scope.fund;
        $ctrl.voucherType = $ctrl.voucher.product ? 'product' : 'budget';
        
        $ctrl.printableTitle = $ctrl.voucher.product ? 
            $ctrl.voucher.product.name : $ctrl.voucher.fund.name;

        $ctrl.organization = $ctrl.printable.scope.organization;
        $ctrl.qrCodeValue = $ctrl.voucher.address;
        $ctrl.webshopUrl = $ctrl.fund.url_webshop;

        $timeout(() => {
            window.print();
            $ctrl.close();
        }, 500);
    };
};

module.exports = {
    bindings: {
        close: '=',
        printable: '=',
    },
    controller: [
        '$timeout',
        PrintableVoucherQrCodeComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/printables/printable-voucher-qr_code.html';
    }
};
