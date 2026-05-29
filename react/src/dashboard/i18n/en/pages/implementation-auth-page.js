export default {
    title: 'Login page',
    menu: {
        name: 'Login page',
        description: 'Manage the login page, available login options, and additional information.',
    },
    buttons: {
        view_page: 'View homepage',
    },
    sections: {
        hero: 'Hero section',
        login: 'Login section',
        info: 'Information section',
    },
    labels: {
        title: 'Title (H1)',
        login_title: 'Title (H2)',
        login_options: 'Select login options',
        login_options_unavailable: 'Unavailable login options',
        info_enabled: 'Show',
        info_title: 'Title (H2)',
        info_description: 'Extra description',
    },
    descriptions: {
        login: 'Only available options are shown on the webshop. Unavailable options remain saved.',
    },
    options: {
        email: 'Email address',
        digid: 'DigiD',
        qr: 'Me app',
    },
    tooltips: {
        email: 'Shows the option to receive a login link by email.',
        digid: 'Shows DigiD as a login option when DigiD is available.',
        digid_disabled: 'DigiD is not available for this webshop.',
        qr: 'Shows the option to log in with the Me app.',
    },
    placeholders: {
        info_description: 'Add description',
    },
    hints: {
        info_description: 'Maximum 1000 characters.',
        login_options_unavailable: 'These options are only shown on the webshop when the connection is available.',
    },
};
