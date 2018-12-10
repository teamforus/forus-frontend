let VouchersComponent = function(
    $state,
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
        '$state',
        'ConfigService',
        VouchersComponent
    ],
    templateUrl: 'assets/tpl/pages/vouchers.html'
};