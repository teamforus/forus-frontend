const apiUrl = "http://forus-backend-app/api/v1";

const baseImplementationKey = 'nijmegen';
const supportSupportId = false;
const sessions = false;
const google_maps_api_key = '';

const me_app_link = 'https://forus.io/DL';
const ios_ipad_link = 'https://testflight.apple.com/join/gWw1lXyB';
const ios_iphone_link = 'https://testflight.apple.com/join/gWw1lXyB';
const android_link = 'https://media.forus.io/static/me-0.0.5-staging-7-release.apk';

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

    core.enableOnly([
        'webshop_general'
    ]);

    return core;
};