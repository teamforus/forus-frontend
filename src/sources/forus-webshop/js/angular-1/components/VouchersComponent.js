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
        }
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