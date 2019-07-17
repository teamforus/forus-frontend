let PrintableVoucherQrCodeComponent = function($timeout) {
    let $ctrl = this;

    $ctrl.qrCodeValue = null;

    $ctrl.$onInit = () => {
        $ctrl.voucher = $ctrl.printable.scope.voucher;
        $ctrl.organization = $ctrl.printable.scope.organization;
        $ctrl.qrCodeValue = $ctrl.voucher.address;

        $timeout(() => {
            window.print();
            $ctrl.close();
        }, 0);
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
        PrintableVoucherQrCodeComponent
    ],
    templateUrl: () => {
        return '/assets/tpl/printables/printable-voucher-qr_code.html';
    }
};