let VoucherComponent = function(
    $state,
    $rootScope,
    $timeout,
    CredentialsService,
    IdentityService,
    AuthService,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.transactions = [];

    $ctrl.$onInit = function() {
        let qrCodeEl = document.getElementById('voucher_qr');

        new QRCode(qrCodeEl, {
            text: JSON.stringify({
                type: 'voucher',
                value: $ctrl.voucher.address
            })
        });

        let addType = (type, transaction) => {
            transaction.type = type;

            return transaction;
        };

        $ctrl.transactions = $ctrl.voucher.transactions.slice().map(
            transaction => addType('transaction', transaction)
        ).concat($ctrl.voucher.product_vouchers.map(
            product_voucher => addType('product_voucher', product_voucher)
        )).sort((a, b) => a.timestamp - b.timestamp);

        qrCodeEl.removeAttribute('title');
    };
};

module.exports = {
    bindings: {
        voucher: '<'
    },
    controller: [
        '$state',
        '$rootScope',
        '$timeout',
        'CredentialsService',
        'IdentityService',
        'AuthService',
        'appConfigs',
        VoucherComponent
    ],
    templateUrl: 'assets/tpl/pages/voucher.html'
};