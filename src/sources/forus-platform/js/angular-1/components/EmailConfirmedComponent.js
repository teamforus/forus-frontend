const EmailConfirmedComponent = function($rootScope) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $rootScope.showAppHeader = false;
    }
};

module.exports = {
    bindings: {},
    controller: [
        '$rootScope',
        EmailConfirmedComponent,
    ],
    templateUrl: 'assets/tpl/pages/email-confirmed.html',
};