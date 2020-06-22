const environment = {
    // browserstack environment
    browserstack: {
        user: '<your-browserstack-username>',
        key: '<your-browserstack-key>',
        local: true,
    },

    // email client
    email: {
        user: "<your-email-client>",
        pass: "<your-email-client-password>",
        port: "<your-email-client-port>",
        host: "<your-email-client-host>",
        tls: false,
        ssl: true,
    },

    // browser
    browser: {
        name: 'chrome',
        version: '83.0',
        window: {
            width: 1920,
            height: 1080,
        }
    },

    // test environment
    urls: {
        requester: "http://localhost:5500",
        provider: "http://localhost:4000",
        validator: "http://localhost:4500",
        sponsor: "http://localhost:3500",
    },

    // identity
    active_account: "<your session token>",
    active_organization: "<active_organization>",
};

module.exports = environment;