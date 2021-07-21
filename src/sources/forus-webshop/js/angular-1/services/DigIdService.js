const DigIdService = function(ApiRequest, appConfigs) {
    const apiPrefix = '/platform/digid';

    return new (function() {
        const self = this;

        self.start = (query) => {
            const { digid_api_url } = appConfigs.features;

            return ApiRequest.post(apiPrefix, query, {}, true, (config) => {
                return { ...config, url: digid_api_url + apiPrefix };
            });
        };

        self.startFundRequst = (fund_id) => {
            return self.start({
                fund_id: fund_id,
                request: 'fund_request'
            });
        };

        self.startAuthRestore = () => {
            return self.start({
                request: 'auth'
            });
        };
    });
};

module.exports = [
    'ApiRequest',
    'appConfigs',
    DigIdService
];