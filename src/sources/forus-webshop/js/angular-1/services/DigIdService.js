let DigIdService = function(ApiRequest) {
    let apiPrefix = '/platform/digid';

    return new(function() {
        let self = this;

        self.start = (query) => {
            return ApiRequest.post(apiPrefix, query);
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
    DigIdService
];