let AccessibilityComponent = function(
    $sce,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.vars = {
            'nijmegen': {
                'implementation_name': 'Inkomensondersteuning',
                'organization_name': 'Nijmegen',
                'contact_email': 'gemeente@nijmegen.nl',
                'website': 'https://inkomensondersteuning.nijmegen.nl/',
                'accessibility_link': 'https://www.nijmegen.nl/toegankelijkheid',
                'telephone_numer': '14 024'
            },
            'westerkwartier': {
                'implementation_name': 'Kindpakket',
                'organization_name': 'Westerkwartier',
                'website': 'https://westerkwartier.forus.io/',
                'contact_email': 'webmaster@westerkwartier.nl',
                'accessibility_link': 'www.westerkwartier.nl/toegankelijkheid',
                'telephone_numer': '​14 0594'
            },
            'noordoostpolder': {
                'implementation_name': 'Meedoenpakket',
                'organization_name': 'Noordoostpolder',
                'website': 'https://noordoostpolder.forus.io/',
                'contact_email': 'info@noordoostpolder.nl',
                'accessibility_link': 'https://www.noordoostpolder.nl/toegankelijkheid',
                'telephone_numer': '0527 63 39 11'
            },
            'groningen': {
                'implementation_name': 'Stadjerspas',
                'organization_name': 'Groningen',
                'website': 'https://stadjerspas.gemeente.groningen.nl',
                'contact_email': 'stadjerspas@groningen.nl',
                'accessibility_link': 'https://gemeente.groningen.nl/toegankelijkheid',
                'telephone_numer': '14 050'
            },
            'geertruidenberg': {
                'implementation_name': 'Kindregelingen',
                'organization_name': 'Geertruidenberg',
                'website': 'https://kindregeling.geertruidenberg.nl',
                'contact_email': 'communicatie@geertruidenberg.nl',
                'accessibility_link': 'https://www.geertruidenberg.nl/en/node/781',
                'telephone_numer': '14 0162'
            }                   
        }[appConfigs.client_key];

        $ctrl.description_html = $sce.trustAsHtml($ctrl.page.description_html);
    };
}

module.exports = {
    bindings: {
        page: '<',
    },
    controller: [
        '$sce',
        'appConfigs',
        AccessibilityComponent
    ],
    templateUrl: 'assets/tpl/pages/accessibility.html'
};
