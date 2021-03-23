let TransactionComponent = function(appConfigs) {
    let $ctrl = this;

    $ctrl.$onInit = function () {
        $ctrl.appConfigs = appConfigs;
    };
};

module.exports = {
    bindings: {
        transaction: '<',
    },
    controller: [
        'appConfigs',
        TransactionComponent
    ],
    templateUrl: 'assets/tpl/pages/transaction.html'
};