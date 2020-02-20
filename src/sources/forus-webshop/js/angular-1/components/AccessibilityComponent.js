let AccessibilityComponent = function(
    appConfigs
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.vars = {
            'nijmegen': {
                'organization_name': 'Nijmegen',
                'contact_email': 'gemeente@nijmegen.nl',
                'website': 'https://nijmegen.forus.io/',
                'accessibility_link': 'https://www.nijmegen.nl/toegankelijkheid',
            },
            'westerkwartier': {
                'organization_name': 'Westerkwartier',
                'website': 'https://westerkwartier.forus.io/',
                'contact_email': 'webmaster@westerkwartier.nl',
                'accessibility_link': 'www.westerkwartier.nl/toegankelijkheid',
            },
            'noordoostpolder': {
                'organization_name': 'Noordoostpolder',
                'website': '',
                'contact_email': '',
                'accessibility_link': '',
            }
        }[appConfigs.client_key];
    };
}

module.exports = {
    controller: [
        'appConfigs',
        AccessibilityComponent
    ],
    templateUrl: ['appConfigs', (appConfigs) => {
        return 'assets/tpl/pages/' + (
            !appConfigs.flags.secondLogo ? 'accessibility.html' : 'accessibility-sdoa.html'
        );
    }]
};