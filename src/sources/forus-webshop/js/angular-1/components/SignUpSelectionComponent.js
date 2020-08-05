let SignUpSelectionComponent = function(
    appConfigs,
) {
    let $ctrl = this;

    $ctrl.goToSignUpPage = (clientType) => {
        let fronts = appConfigs.features.fronts;

        document.location.href = {
            'provider': fronts.url_provider,
            'validator': fronts.url_validator,
            'sponsor': fronts.url_sponsor,
        } [clientType] + 'sign-up';
    }

    $ctrl.$onInit = function() {};
};

module.exports = {
    bindings: {},
    controller: [
        'appConfigs',
        SignUpSelectionComponent
    ],
    templateUrl: 'assets/tpl/pages/sign-up-options.html'
};