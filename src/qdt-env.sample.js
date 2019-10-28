let api_url = "https://dev.api.forus.io/api/v1";

module.exports = (core) => {
    // Config markups
    core.editPlatform('dashboard_markup', (platform) => platform);
    core.editPlatform('webshop_markup', (platform) => platform);
    
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

    core.editPlatform('dashboard_berkelland_provider', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'berkelland',
            panel_type: 'provider',
            chat_id: false
        });

        return platform;
    });

    core.editPlatform('dashboard_berkelland_sponsor', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'berkelland',
            panel_type: 'sponsor',
            chat_id: false
        });

        return platform;
    });

    core.editPlatform('dashboard_oostgelre_provider', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'oostgelre',
            panel_type: 'provider',
            chat_id: false
        });

        return platform;
    });

    core.editPlatform('dashboard_oostgelre_sponsor', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'oostgelre',
            panel_type: 'sponsor',
            chat_id: false
        });

        return platform;
    });

    core.editPlatform('dashboard_winterswijk_provider', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'winterswijk',
            panel_type: 'provider',
            chat_id: false
        });

        return platform;
    });

    core.editPlatform('dashboard_winterswijk_sponsor', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'winterswijk',
            panel_type: 'sponsor',
            chat_id: false
        });

        return platform;
    });

    core.editPlatform('dashboard_kerstpakket_provider', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'kerstpakket',
            panel_type: 'provider',
            chat_id: false
        });

        return platform;
    });

    core.editPlatform('dashboard_kerstpakket_sponsor', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'kerstpakket',
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
            log_out_time: 15,
            matomo_site_id: false,
            // set false to disable auto-logout
            // log_out_time: false,
        });

        return platform;
    });

    core.editPlatform('webshop_zuidhorn', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'zuidhorn',
            client_type: 'webshop',
            log_out_time: 15,
            matomo_site_id: false,
        });

        return platform;
    });

    core.editPlatform('webshop_nijmegen', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_type: 'webshop',
            client_key: 'nijmegen',
            log_out_time: 15,
            matomo_site_id: false,
        });

        return platform;
    });

    core.editPlatform('webshop_kerstpakket', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'kerstpakket',
            client_type: 'webshop',
            log_out_time: 15,
            matomo_site_id: false,
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

    core.editPlatform('webshop_berkelland', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'berkelland',
            client_type: 'webshop',
            log_out_time: 15,
            matomo_site_id: false,
        });

        return platform;
    });

    core.editPlatform('webshop_oostgelre', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'oostgelre',
            client_type: 'webshop',
            log_out_time: 15,
            matomo_site_id: false,
        });

        return platform;
    });

    core.editPlatform('webshop_winterswijk', (platform) => {
        platform.setEnvData({
            api_url: api_url,
            client_key: 'winterswijk',
            client_type: 'webshop',
            log_out_time: 15,
            matomo_site_id: false,
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

    //- Enable only given platforms
    /* core.enableOnly([

    ]); */

    //- Enable all but given platforms
    core.disableOnly([
        'dashboard_markup',
        'webshop_markup'
    ]);

    return core;
};
