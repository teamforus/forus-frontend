export default {
    title: 'Inlog pagina',
    menu: {
        name: 'Inlog pagina',
        description: 'Beheer de inlogpagina, beschikbare inlogopties en aanvullende uitleg.',
    },
    buttons: {
        view_page: 'Bekijk homepage',
    },
    sections: {
        hero: 'Hero section',
        login: 'Login section',
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
        qr: 'Me-app',
    },
    tooltips: {
        email: 'Toont de optie om een inloglink per e-mail te ontvangen.',
        digid: 'Toont DigiD als inlogoptie wanneer DigiD beschikbaar is.',
        digid_disabled: 'DigiD is niet beschikbaar voor deze webshop.',
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
