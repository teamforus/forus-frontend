const FeaturesService = function () {
    return new (function () {
        this.list = [{
            key: 'bi_tools',
            name: 'BI-tool API',
            description: 'API-koppeling met Business Intelligence (BI) tools voor data-export.',
            overview_description: 'Maak gebruik van de API-koppeling met Business Intelligence (BI) tools om gegevens te exporteren.',
            labels: ['Koppeling', 'Business Intelligence', 'Management'],
        }, {
            key: 'email_connection',
            name: 'E-mailkoppeling',
            description: 'Mogelijkheid om systeemgerelateerde e-mails te versturen vanuit een gepersonaliseerd adres van uw organisatie.',
            overview_description: 'Verstuur systeemgerelateerde e-mails vanuit een gepersonaliseerd adres van uw organisatie.',
            labels: ['E-mail', 'Communicatie', 'Beveiliging'],
        }, {
            key: 'backoffice_api',
            name: 'Backoffice API',
            description: 'Koppeling met de gemeente-API voor naadloze gegevensintegratie.',
            overview_description: 'Integreer gegevens met de gemeente-API.',
            labels: ['Integratie', 'Gegevens', 'Gemeente API'],
        }, {
            key: 'iconnect_api',
            name: 'Haal Centraal API',
            description: 'Toegang tot BRP-gegevens en weergave in het Forus platform.',
            overview_description: 'Verkrijg toegang tot BRP-gegevens en bekijk ze in het Forus-platform.',
            labels: ['Integratie', 'Gegevens', 'BRP', 'API'],
        }, {
            key: 'digid',
            name: 'DigiD',
            description: 'Een koppeling met DigiD voor digitale identificatie binnen Forus.',
            overview_description: 'Faciliteer het proces voor deelnemers: laat deelnemers inloggen en fondsen aanvragen met DigiD.',
            labels: ['Koppeling', 'Beveiliging', 'Identificatie'],
        }, {
            key: 'bng',
            name: 'BNG',
            description: 'Geautomatiseerde financiële transacties tussen Forus en de rekening van uw organisatie bij de Bank Nederlandse Gemeenten (BNG).',
            overview_description: 'Maak gebruik van geautomatiseerde financiële transacties tussen Forus en uw ' +
                'organisatierekening bij de Bank Nederlandse Gemeenten (BNG).',
            labels: ['Koppeling', 'Financieel'],
        }, {
            key: 'reimbursements',
            name: 'Declaraties',
            description: 'Mogelijkheid voor deelnemers om bonnen en facturen in te dienen ter vergoeding van kosten.',
            overview_description: 'Faciliteer deelnemers bij het indienen van bonnen en facturen ter vergoeding van kosten.',
            labels: ['Declaraties', 'Kostenvergoeding', 'Beoordeling'],
        }, {
            key: 'auth_2_fa',
            name: 'Tweefactorauthenticatie (2FA)',
            description: 'Extra beveiligingslaag voor accountbescherming.',
            overview_description: 'Voeg een extra beveiligingslaag toe voor de bescherming van uw account.',
            labels: ['Beveiliging', 'Accountbescherming', '2FA'],
        }, {
            key: 'physical_cards',
            name: 'Fysieke pas',
            description: 'Aanvragen en uitgifte van een fysieke pas met persoonlijke QR.',
            overview_description: 'Geef minder digitaal vaardige deelnemers een alternatief voor digitale toegang.',
            labels: ['Fysieke pas', 'Stadspas', 'Minder digitaal vaardigen'],
        }];

        this.disabled = [{
            key: 'voucher_records',
            name: 'Eigenschappen op voucher',
            description: 'Voeg persoonlijke eigenschappen toe en exporteer ze bij vouchers.',
            overview_description: ' Voeg persoonlijke eigenschappen toe en exporteer ze bij vouchers.',
            labels: ['Gebruiksvriendelijkheid'],
        }];

        this.previewList = [[{
            key: 'digid',
            name: 'DigiD',
            description: 'Laat deelnemers inloggen en fondsen aanvragen met DigiD',
        }, {
            key: 'auth_2_fa',
            name: 'Tweefactorauthenticatie',
            description: 'Een extra beveiligingslaag voor de bescherming van uw account',
        }], [{
            key: 'bng',
            name: 'BNG',
            description: 'Geautomatiseerde financiële transacties ',
        }, {
            key: 'bi_tools',
            name: 'BI-tool API',
            description: 'Exporteer gegevens met BI-tool API',
        }]];

        this.getAdditionalFeatures = (feature) => {
            const additionalFeatures = {
                'bng': ['digid', 'auth_2_fa'],
                'digid': ['bng', 'auth_2_fa'],
                'bi_tools': ['bng', 'auth_2_fa'],
                'auth_2_fa': ['bng', 'digid'],
                'iconnect_api': ['bi_tools', 'auth_2_fa'],
                'backoffice_api': ['bi_tools', 'auth_2_fa'],
                'reimbursements': ['bng', 'auth_2_fa'],
                'email_connection': ['bi_tools', 'auth_2_fa'],
                'physical_cards': ['bi_tools', 'auth_2_fa'],
            }[feature] || [];

            return this.list.filter((feature) => additionalFeatures.includes(feature.key));
        };
    });
};

module.exports = [
    FeaturesService,
];
