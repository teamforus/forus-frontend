module.exports = ['ApiRequestProvider', 'appConfigs', (
    ApiRequestProvider, appConfigs
) => {
    ApiRequestProvider.setHost(appConfigs.api_url);
}];