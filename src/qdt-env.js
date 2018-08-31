let api_url = "https://test.platform.forus.io/api/v1";

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
            "forus-webshop.markup",
            "forus-webshop.panel",
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
            "forus-platform.markup",
            "forus-platform.sponsor",
            "forus-platform.provider",
            "forus-platform.validator",
            "forus-webshop.markup",
            "forus-webshop.panel",
        ]
    },
    platforms_data: {
        "forus-platform-markup": {
            api_url: api_url,
        },
        "forus-platform.sponsor": {
            api_url: api_url,
            panel_type: 'sponsor'
        },
        "forus-platform.provider": {
            api_url: api_url,
            panel_type: 'provider'
        },
        "forus-platform.validator": {
            api_url: api_url,
            panel_type: 'validator'
        },
        "forus-webshop.markup": {
            api_url: api_url,
        },
        "forus-webshop.panel": {
            api_url: api_url,
        },
    }
};
