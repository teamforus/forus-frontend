let api_url = "https://dev.api.forus.link/api/v1";
let about_url = "https://about.forus.io/";

module.exports = (core) => {
    // Config dashboards
    core.editPlatform('dashboard_general_sponsor', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'general',
            panel_type: 'sponsor',
            chat_id: false,
            // html5ModeEnabled: true,
            // html5Mode: {
            //    basePath: '/'
            // }
        });

        return platform;
    });

    core.editPlatform('dashboard_general_provider', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'general',
            panel_type: 'provider',
            chat_id: false
        });

        return platform;
    });

    core.editPlatform('dashboard_general_validator', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'general',
            panel_type: 'validator',
            chat_id: false
        });

        return platform;
    });

    core.editPlatform('dashboard_zuidhorn_sponsor', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'zuidhorn',
            panel_type: 'sponsor',
            chat_id: false
        });

        return platform;
    });

    core.editPlatform('dashboard_zuidhorn_provider', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'zuidhorn',
            panel_type: 'provider',
            chat_id: false
        });

        return platform;
    });

    core.editPlatform('dashboard_westerkwartier_provider', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'westerkwartier',
            panel_type: 'provider',
            chat_id: false
        });

        return platform;
    });

    core.editPlatform('dashboard_nijmegen_sponsor', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'nijmegen',
            panel_type: 'sponsor',
            chat_id: false
        });

        return platform;
    });

    core.editPlatform('dashboard_nijmegen_provider', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'nijmegen',
            panel_type: 'provider',
            chat_id: false
        });

        return platform;
    });

    core.editPlatform('dashboard_westerkwartier_sponsor', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'westerkwartier',
            panel_type: 'sponsor',
            chat_id: false
        });

        return platform;
    });

    // Config webshops
    core.editPlatform('webshop_general', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'general',
            client_type: 'webshop',
            about_url: about_url
        });

        return platform;
    });

    core.editPlatform('webshop_zuidhorn', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'zuidhorn',
            client_type: 'webshop',
        });

        return platform;
    });

    core.editPlatform('webshop_nijmegen', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_type: 'webshop',
            client_key: 'nijmegen',
        });

        return platform;
    });

    core.editPlatform('webshop_forus', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'forus',
            client_type: 'webshop',
            about_url: about_url
        });

        return platform;
    });

    core.editPlatform('webshop_westerkwartier', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'westerkwartier',
            client_type: 'webshop',
        });

        return platform;
    });

    // Config meapp landings
    core.editPlatform('website', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'general',
            panel_type: 'validator',
        });

        return platform;
    });

    return core;
};