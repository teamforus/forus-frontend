let VouchersComponent = function(
    ConfigService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
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
        'ConfigService',
        VouchersComponent
    ],
    templateUrl: 'assets/tpl/pages/vouchers.html'
};