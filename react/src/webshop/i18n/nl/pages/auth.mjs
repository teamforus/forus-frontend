export default {
    title: 'Inloggen',
    setup_2fa_title: 'Tweefactorauthenticatie instellen',
    choose_option: 'Kies een optie',
    '2fa_title': 'Tweefactorauthenticatie',
    logout: 'Uitloggen',
    back: 'Terug',
    options: {
        qr: {
            title: 'Me app',
            description: 'Scan een QR-code met de&nbsp;<u>Me app</u>',
        },
        email: {
            title: 'E-mailadres',
            description: 'Ontvang een inloglink per e-mail',
        },
        digid: {
            title: 'DigiD',
            description: 'Open DigiD inlogscherm',
        },
    },
    privacy_link: {
        text: 'Ik heb de <a tabIndex="3" target="_blank" href="{{ link_url }}">privacyverklaring</a> gelezen',
    },

    terms_link: {
        text: 'Ik ga akkoord met de <a tabIndex="3" target="_blank" href="{{ link_url }}">voorwaarden</a>',
    },

    push: {
        link_used: {
            title: 'Deze link is reeds gebruikt of ongeldig.',
        },
    },
};
