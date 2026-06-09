export default {
    title: 'Login page',
    menu: {
        name: 'Login page',
        description: 'Manage the login page, available login options, and additional information.',
    },
    openid_settings: {
        title: 'OpenID settings',
        page_title: 'ID-Wallet settings',
        menu: {
            name: 'OpenID settings',
            description: 'Manage whether ID-Wallet is available for this webshop.',
        },
        sections: {
            settings: 'Settings',
        },
        labels: {
            status: 'Status',
            flows: 'Available wallets',
        },
        info: {
            not_configured:
                'The Ver.id connection is not configured yet. OpenID can be enabled after platform support ' +
                'completes the setup.',
        },
        hints: {
            enable_to_select_flows: 'Enable wallet login to choose wallet options.',
        },
        notifications: {
            saved: 'Saved!',
        },
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
        openid: 'ID-Wallet',
        qr: 'Me app',
    },
    tooltips: {
        email: 'Shows the option to receive a login link by email.',
        digid: 'Shows DigiD as a login option when DigiD is available.',
        digid_disabled: 'DigiD is not available for this webshop.',
        openid: 'Shows ID-Wallet as a login option when OpenID is available.',
        openid_disabled: 'ID-Wallet is not available for this webshop.',
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
