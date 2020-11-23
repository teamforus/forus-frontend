let PrivacyComponent = function(
    appConfigs
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.vars = {
            'groningen': {
                'organization_name': 'Groningen',
                'website': 'https://gemeente.groningen.nl/privacyverklaring',
            }
        }[appConfigs.client_key];
    };
}

module.exports = {
    controller: [
        'appConfigs',
        PrivacyComponent
    ],
    templateUrl: 'assets/tpl/pages/privacy.html'
};
