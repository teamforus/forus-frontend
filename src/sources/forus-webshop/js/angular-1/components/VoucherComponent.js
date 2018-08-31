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

    $ctrl.$onInit = function() {
        let qrCodeEl = document.getElementById('voucher_qr');

        new QRCode(qrCodeEl, {
            text: JSON.stringify({
                type: 'voucher',
                value: $ctrl.voucher.address
            })
        });

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