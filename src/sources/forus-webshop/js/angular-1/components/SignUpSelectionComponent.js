let SignUpSelectionComponent = function(appConfigs) {
    const $ctrl = this;

    $ctrl.$onInit = () => $ctrl.appConfigs = appConfigs;
};

module.exports = {
    bindings: {},
    controller: [
        'appConfigs',
        SignUpSelectionComponent
    ],
    templateUrl: 'assets/tpl/pages/sign-up-options.html'
};