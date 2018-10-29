let api_url = "https://dev.api.forus.link/api/v1";

let frontends = {
    'me_app': '#',
    'sponsor': '#',
    'provider': '#',
    'validator': '#',
    'webshop': '#',
};

module.exports = {
    // browsersync configs
    server: {
        enabled: true,
        // choose, which platform should be served
        // you can serve few platforms at the same time, 
        // but make sure each of them use unique port number
        platform: [
            "forus-platform.markup",
            "forus-platform.sponsor",
            "forus-platform.provider",
            "forus-platform.validator",
            "forus-landing-meapp",
            // "forus-webshop.markup",
            "forus-webshop.panel",
            // "forus-webshop-zuidhorn.markup",
            "forus-webshop-zuidhorn.panel",
            "forus-webshop-nijmegen.panel"
        ],
        // browsersync reloads browser when watched files are modified,
        // here you can choose which platform besides "served" will make
        // browsersync to reload.
        // Sometimes "served" platform rely on foreign platform
        watch_platforms: "all"
    },
    platforms: {
        // choose which platforms will be enabled, otherwise completely ignored
        enabled: [
            // "forus-platform.markup",
            "forus-platform.sponsor",
            "forus-platform.provider",
            "forus-platform.validator",
            "forus-landing-meapp",
            // "forus-webshop.markup",
            "forus-webshop.panel",
            // "forus-webshop-zuidhorn.markup",
            "forus-webshop-zuidhorn.panel",
            "forus-webshop-nijmegen.panel"
        ]
    },
    platforms_data: {
        "forus-landing-meapp": {
            api_url: api_url,
            frontends: frontends,
        },
        "forus-platform-markup": {
            api_url: api_url,
            frontends: frontends,
        },
        "forus-platform.sponsor": {
            api_url: api_url,
            frontends: frontends,
            panel_type: 'sponsor',
        },
        "forus-platform.provider": {
            api_url: api_url,
            frontends: frontends,
            panel_type: 'provider',
        },
        "forus-platform.validator": {
            api_url: api_url,
            frontends: frontends,
            panel_type: 'validator',
        },
        /* "forus-webshop.markup": {
            api_url: api_url,
            frontends: frontends,
        }, */
        "forus-webshop.panel": {
            api_url: api_url,
            frontends: frontends,
            client_key: 'shop-general'
        },
        /* "forus-webshop-zuidhorn.markup": {
            api_url: api_url,
            frontends: frontends,
        }, */
        "forus-webshop-zuidhorn.panel": {
            api_url: api_url,
            frontends: frontends,
            client_key: 'shop-zuidhorn'
        },
        "forus-webshop-nijmegen.panel": {
            api_url: api_url,
            frontends: frontends,
            client_key: 'shop-zuidhorn'
        }
    }
};