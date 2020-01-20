let ErrorComponent = function($filter, $stateParams) {
    let $ctrl = this;
    
    // TODO: move messages to translation files 
    let $translate = $filter('translate');

    let titles = {
        'unknown_error': 'Unknown error',
        
        // digid
        'digid_api_0000': 'Er is een fout opgetreden tijdens het aanvragen.',
        'digid_uid_used': 'BSN-nummer al gebruikt.',
        'digid_uid_dont_match': 'Er is al een BSN-nummer bekend bij dit profiel',
        'digid_uid_not_found': 'Dit BSN-nummer is onbekend in het systeem',

        // digid errors
        'digid_unknown_error': 'Er is een fout opgetreden in de communicatie met DigiD.',
        'digid_0001': 'Inlogpoging geannuleerd.', // 'DigiD - Unavailable',
        'digid_0002': 'Inlogpoging geannuleerd.', // 'DigiD - temporarily unavailable',
        'digid_0003': 'Inlogpoging geannuleerd.', // 'DigiD - verification failed',
        'digid_0004': 'Inlogpoging geannuleerd.', // 'DigiD - verification failed',
        'digid_0030': 'Inlogpoging geannuleerd.', // 'DigiD - illegal_request',
        'digid_0032': 'Inlogpoging geannuleerd.', // 'DigiD - error app id',
        'digid_0033': 'Inlogpoging geannuleerd.', // 'DigiD - error a select',
        'digid_0040': 'DigiD - Inlogpoging geannuleerd.',
        'digid_0050': 'Inlogpoging geannuleerd.', // 'DigiD - busy',
        'digid_0070': 'Inlogpoging geannuleerd.', // 'DigiD - Invalid session',
        'digid_0080': 'Inlogpoging geannuleerd.', // 'DigiD - Web service not active',
        'digid_0099': 'Inlogpoging geannuleerd.', // 'DigiD - Web service not authorized',
        'digid_010c': 'Inlogpoging geannuleerd.', // 'DigiD - temporarily unavailable',
    };

    let digiDefaultMessage = [
        'Probeert u het later nogmaals. Indien deze fout blijft aanhouden, kijk', 
        'dan op de website https://www.digid.nl/ voor de laatste informatie.'
    ].join('');

    let messages = {
        'unknown_error': 'Unknown error occurred',

        // digid
        'digid_api_0000': [
            'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Molestiae incidunt, ', 
            'quia beatae, in, veritatis officia tempore ab reiciendis eos adipisci id? Consectetur ', 
            'aspernatur eius vero eos? Dolorem architecto aperiam omnis sint fugiat?'
        ].join(),
        'digid_uid_used': [
            'Het BSN-nummer is al ingebruik op een ander account. ', 
            'Herstel uw account op het inlog venster om verder te gaan.'
        ].join(),
        'digid_uid_dont_match': [
            'Het BSN nummer dat u opgehaald heeft met DigiD verschilt met het BSN-nummer ', 
            'gekoppelt staat aan dit profiel. Start een nieuwe aanvraag.'
        ],
        'digid_uid_not_found': [
            'Dit BSN-nummer is onbekend in het systeem. ', 
            'Start uw aanvraag om een account aan te maken.'
        ],

        // digid errors
        'digid_unknown_error': [
            'Probeert u het later nogmaals. Indien deze fout blijft aanhouden, ', 
            'kijk dan op de website https://www.digid.nl/ voor de laatste informatie.'
        ].join(),
        'digid_0001': digiDefaultMessage, // 'DigiD - Unavailable',
        'digid_0002': digiDefaultMessage, // 'DigiD - temporarily unavailable',
        'digid_0003': digiDefaultMessage, // 'DigiD - verification failed',
        'digid_0004': digiDefaultMessage, // 'DigiD - verification failed',
        'digid_0030': digiDefaultMessage, // 'DigiD - illegal_request',
        'digid_0032': digiDefaultMessage, // 'DigiD - error app id',
        'digid_0033': digiDefaultMessage, // 'DigiD - error a select',
        'digid_0040': 'U hebt deze inlogpoging geannuleerd. Probeer eventueel opnieuw om verder te gaan.',
        'digid_0050': digiDefaultMessage, // 'DigiD - busy',
        'digid_0070': digiDefaultMessage, // 'DigiD - Invalid session',
        'digid_0080': digiDefaultMessage, // 'DigiD - Web service not active',
        'digid_0099': digiDefaultMessage, // 'DigiD - Web service not authorized',
        'digid_010c': digiDefaultMessage, // 'DigiD - temporarily unavailable',
    };

    $ctrl.$onInit = () => {
        $ctrl.title = titles[$stateParams.errorCode] || 'Unknown error';
        $ctrl.message = messages[$stateParams.errorCode] || '';
    };
}

module.exports = {
    bindings: {
        errorCode: '=',
    },
    controller: [
        '$filter',
        '$stateParams',
        ErrorComponent
    ],
    templateUrl: 'assets/tpl/pages/error.html'
};