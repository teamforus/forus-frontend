const apiUrl = "http://forus-backend-app/api/v1";

const baseImplementationKey = 'nijmegen';
const supportSupportId = false;
const sessions = false;
const google_maps_api_key = '';
const chatId = false;

const outputRoot = "../dist";
const minify = true;
const sourcemap = true;

const me_app_link = 'https://forus.io/DL';
const ios_ipad_link = 'https://testflight.apple.com/join/gWw1lXyB';
const ios_iphone_link = 'https://testflight.apple.com/join/gWw1lXyB';
const android_link = 'https://media.forus.io/static/me-0.0.5-staging-7-release.apk';

const supported_devices_link = '';
const help_link = 'https://forus.io';

module.exports = (core) => {
    // Config webshops
    core.editPlatform('webshop_general', (platform) => {
        platform.setEnvData({
            api_url: apiUrl,
            client_key: baseImplementationKey,
            client_type: 'webshop',
            support_id: supportSupportId,
            matomo_site_id: false,
            provider_sign_up_filters: {},
            flags: {},
            sessions: sessions,
            google_maps_api_key: google_maps_api_key,
            android_link: android_link,
            me_app_link: me_app_link,
            ios_ipad_link: ios_ipad_link,
            ios_iphone_link: ios_iphone_link,
            html5ModeEnabled: true,
            html5Mode: {
                basePath: '/'
            },
        });

        // change server port
        platform.serve(3000, '/');

        return platform;
    });

    // Config dashboards
    core.editPlatform('dashboard_general_sponsor', (platform) => {
        platform.setEnvData({
            api_url: apiUrl,
            client_key: baseImplementationKey,
            panel_type: 'sponsor',
            chat_id: chatId,
            support_id: supportSupportId,
            flags: {},
            sessions: sessions,
            hide_vouchers_csv: false,
            google_maps_api_key: google_maps_api_key,
            me_app_link: me_app_link,
            android_link: android_link,
            ios_ipad_link: ios_ipad_link,
            ios_iphone_link: ios_iphone_link,
            help_link: help_link,
            html5ModeEnabled: true,
            html5Mode: {
                basePath: '/'
            }
        });

        platform.setDestRootPath(outputRoot + '/forus-platform.sponsor.general');
        platform.editTask('js', (task) => ({ ...task, minify, sourcemap }));
        platform.serve(4000, '/');

        return platform;
    });

    core.editPlatform('dashboard_general_provider', (platform) => {
        platform.setEnvData({
            api_url: apiUrl,
            client_key: baseImplementationKey,
            panel_type: 'provider',
            support_id: supportSupportId,
            chat_id: chatId,
            hide_voucher_generators: false,
            flags: {},
            sessions: sessions,
            google_maps_api_key: google_maps_api_key,
            me_app_link: me_app_link,
            ios_ipad_link: ios_ipad_link,
            ios_iphone_link: ios_iphone_link,
            android_link: android_link,
            supported_devices_link: supported_devices_link,
            help_link: help_link,
            html5ModeEnabled: true,
            html5Mode: {
                basePath: '/'
            }
        });

        platform.editTask('js', (task) => ({ ...task, minify, sourcemap }));
        platform.serve(5000, '/');

        return platform;
    });

    core.editPlatform('dashboard_general_validator', (platform) => {
        platform.setEnvData({
            api_url: apiUrl,
            client_key: baseImplementationKey,
            panel_type: 'validator',
            chat_id: chatId,
            support_id: supportSupportId,
            hide_voucher_generators: false,
            flags: {
                singleRecordValidation: true
            },
            sessions: sessions,
            google_maps_api_key: google_maps_api_key,
            me_app_link: me_app_link,
            ios_ipad_link: ios_ipad_link,
            ios_iphone_link: ios_iphone_link,
            android_link: android_link,
            help_link: help_link,
            html5ModeEnabled: true,
            html5Mode: {
                basePath: '/'
            }
        });

        platform.editTask('js', (task) => ({ ...task, minify, sourcemap }));
        platform.serve(5500, '/');

        return platform;
    });

    core.enableOnly([
        'webshop_general',
        'dashboard_general_sponsor',
        'dashboard_general_provider',
        'dashboard_general_validator',
    ]);

    return core;
};
