let SignUpSelectionComponent = function(
    $state,
    appConfigs,
) {
    let $ctrl = this;
    console.log(appConfigs);

    $ctrl.goToSignUpPage = (clientType) => {
        let fronts = appConfigs.features.fronts;

        document.location.href = {
            'provider' : fronts.url_provider,
            'validator': fronts.url_validator,
            'sponsor'  : fronts.url_sponsor,
        }[clientType] + 'sign-up-v2';
    }

    $ctrl.$onInit = function() {};
};

module.exports = {
    bindings: {},
    controller: [
        '$state',
        'appConfigs',
        SignUpSelectionComponent
    ],
    templateUrl: 'assets/tpl/pages/sign-up-options.html'
};
