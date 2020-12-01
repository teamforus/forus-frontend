let SignUpSelectionComponent = function(appConfigs) {
    let $ctrl = this;

    $ctrl.goToSignUpPage = (clientType) => {
        document.location.href = appConfigs.features.fronts['url_' + clientType] + 'sign-up';
    }
};

module.exports = {
    bindings: {},
    controller: [
        'appConfigs',
        SignUpSelectionComponent
    ],
    templateUrl: 'assets/tpl/pages/sign-up-options.html'
};