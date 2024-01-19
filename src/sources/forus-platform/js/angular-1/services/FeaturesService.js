const snakeCase = require("lodash/snakeCase");
const FeaturesService = function () {
    return new (function () {
        this.list = [{
            key: 'bi_tools',
            name: 'BI-tool API',
            description: 'API-koppeling met Business Intelligence (BI) tools voor data-export.',
            labels: ['Koppeling', 'Business Intelligence', 'Management'],
        }, {
            key: 'email_connection',
            name: 'E-mailkoppeling',
            description: 'Mogelijkheid om systeemgerelateerde e-mails te versturen vanuit een gepersonaliseerd adres van uw organisatie.',
            labels: ['E-mail', 'Communicatie', 'Beveiliging'],
        }, {
            key: 'backoffice_api',
            name: 'Backoffice API',
            description: 'Koppeling met de gemeente-API voor naadloze gegevensintegratie.',
            labels: ['Integratie', 'Gegevens', 'Gemeente API'],
        }, {
            key: 'iconnect_api',
            name: 'Haal Centraal API',
            description: 'Toegang tot BRP-gegevens en weergave in het Forus platform.',
            labels: ['Integratie', 'Gegevens', 'BRP', 'API'],
        }, {
            key: 'digid',
            name: 'DigiD',
            description: 'Een koppeling met DigiD voor digitale identificatie binnen Forus.',
            labels: ['Koppeling', 'Beveiliging', 'Identificatie'],
        }, {
            key: 'bng',
            name: 'BNG',
            description: 'Geautomatiseerde financiële transacties tussen Forus en de rekening van uw organisatie bij de Bank Nederlandse Gemeenten (BNG)..',
            labels: ['Koppeling', 'Financieel'],
        }, {
            key: 'reimbursements',
            name: 'Declaraties',
            description: 'Mogelijkheid voor inwoners om bonnen en facturen in te dienen ter vergoeding van kosten.',
            labels: ['Declaraties', 'Kostenvergoeding', 'Beoordeling'],
        }, {
            key: 'auth_2_fa',
            name: 'Tweefactorauthenticatie (2FA)',
            description: 'Extra beveiligingslaag voor accountbescherming.',
            labels: ['Beveiliging', 'Accountbescherming', '2FA'],
        }, {
            key: 'voucher_records',
            name: 'Eigenschappen op voucher',
            description: 'Voeg persoonlijke eigenschappen toe en exporteer ze bij vouchers.',
            labels: ['Gebruiksvriendelijkheid'],
        }, {
            key: 'Fysieke pas',
            name: 'Physical cards',
            description: 'Geef minder digitaal vaardige inwoners een alternatief voor digitale toegang.',
            labels: ['Aanvraag'],
        }];

        this.previewList = [{
            key: 'digid',
            name: 'DigiD',
            description: 'Laat gebruikers inloggen en fondsen aanvragen met DigiD',
        }, {
            key: 'bng',
            name: 'BNG',
            description: 'Geautomatiseerde financiële transacties ',
        }, {
            key: 'auth_2_fa',
            name: 'Tweefactorauthenticatie',
            description: 'Een extra beveiligingslaag voor de bescherming van uw account',
        }, {
            key: 'bi_tools',
            name: 'BI-tool API',
            description: 'Exporteer gegevens met BI-tool API',
        }];

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
            }[feature] || [];

            return this.list.filter((feature) => additionalFeatures.includes(feature.key));
        };
    });
};

module.exports = [
    FeaturesService,
];
