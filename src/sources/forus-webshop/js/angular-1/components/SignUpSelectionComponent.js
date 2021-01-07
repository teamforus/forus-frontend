let SignUpSelectionComponent = function(appConfigs) {
    let $ctrl = this;

    $ctrl.getDashboardAddress = (clientType) => {
        return appConfigs.features.fronts['url_' + clientType];
    };

    $ctrl.goToDashboard = (clientType) => {
        document.location.href = $ctrl.getDashboardAddress(clientType);
    };

    $ctrl.goToSignUpPage = (clientType) => {
        document.location.href = $ctrl.getDashboardAddress(clientType) + 'sign-up';
    };
};

module.exports = {
    bindings: {},
    controller: [
        'appConfigs',
        SignUpSelectionComponent
    ],
    templateUrl: 'assets/tpl/pages/sign-up-options.html'
};