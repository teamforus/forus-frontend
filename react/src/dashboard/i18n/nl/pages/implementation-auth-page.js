export default {
    title: 'Inlog pagina',
    menu: {
        name: 'Inlog pagina',
        description: 'Beheer de inlogpagina, beschikbare inlogopties en aanvullende uitleg.',
    },
    openid_settings: {
        title: 'OpenID instellingen',
        page_title: 'ID-Wallet instellingen',
        menu: {
            name: 'OpenID instellingen',
            description: 'Beheer of ID-Wallet beschikbaar is voor deze webshop.',
        },
        sections: {
            settings: 'Instellingen',
        },
        labels: {
            status: 'Status',
            flows: 'Beschikbare wallets',
        },
        info: {
            not_configured:
                'De Ver.id koppeling is nog niet geconfigureerd. OpenID kan worden ingeschakeld nadat ' +
                'platformbeheer de configuratie heeft afgerond.',
        },
        hints: {
            enable_to_select_flows: 'Schakel inloggen met wallets in om walletopties te kiezen.',
        },
        notifications: {
            saved: 'Opgeslagen!',
        },
    },
    buttons: {
        view_page: 'Bekijk pagina',
    },
    sections: {
        hero: 'Hero sectie',
        login: 'Login sectie',
        info: 'Uitleg sectie',
    },
    labels: {
        title: 'Titel (H1)',
        login_title: 'Titel (H2)',
        login_options: 'Log in opties selecteren',
        login_options_unavailable: 'Niet beschikbare inlogopties',
        info_enabled: 'Tonen',
        info_title: 'Titel (H2)',
        info_description: 'Extra omschrijving',
    },
    descriptions: {
        login: 'Alleen beschikbare opties worden getoond op de webshop. Niet beschikbare opties blijven bewaard.',
    },
    options: {
        email: 'E-mailadres',
        digid: 'DigiD',
        openid: 'ID-Wallet',
        qr: 'Me-app',
    },
    tooltips: {
        email: 'Toont de optie om een inloglink per e-mail te ontvangen.',
        digid: 'Toont DigiD als inlogoptie wanneer DigiD beschikbaar is.',
        digid_disabled: 'DigiD is niet beschikbaar voor deze webshop.',
        openid: 'Toont ID-Wallet als inlogoptie wanneer OpenID beschikbaar is.',
        openid_disabled: 'ID-Wallet is niet beschikbaar voor deze webshop.',
        qr: 'Toont de optie om in te loggen met de Me-app.',
    },
    placeholders: {
        info_description: 'Voeg omschrijving toe',
    },
    hints: {
        info_description: 'Maximaal 1000 tekens.',
        login_options_unavailable: 'Deze opties worden pas getoond op de webshop wanneer de koppeling beschikbaar is.',
    },
};
