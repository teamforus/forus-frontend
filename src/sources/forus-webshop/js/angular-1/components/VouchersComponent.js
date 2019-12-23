let VouchersComponent = function(
    appConfigs,
    ConfigService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.appConfigs = appConfigs;
        $ctrl.ConfigService = ConfigService;
        $ctrl.cfg = {
            showAccountSidebar: ConfigService.getFlag('showAccountSidebar', true)
        };

        $ctrl.productVouchers = $ctrl.vouchers.filter(function(voucher) {
            return voucher.type == 'product';
        });

        $ctrl.regularVouchers = $ctrl.vouchers.filter(function(voucher) {
            return voucher.type == 'regular';
        });

        /* TODO fix */
        $ctrl.expiredVouchers = $ctrl.vouchers.filter(function(voucher) {
            return voucher.type == 'regular';
        });
    };

};

module.exports = {
    bindings: {
        vouchers: '<'
    },
    controller: [
        'appConfigs',
        'ConfigService',
        VouchersComponent
    ],
    templateUrl: 'assets/tpl/pages/vouchers.html'
};