const sprintf = require('sprintf-js').sprintf;

const FundRequestService = function(ApiRequest) {
    const uriPrefix = '/platform/funds/%s/requests';

    const FundRequestService = function() {
        this.index = function(fund_id, data = {}) {
            return ApiRequest.get(sprintf(uriPrefix, fund_id), data);
        };

        this.store = function(fund_id, data) {
            return ApiRequest.post(sprintf(uriPrefix, fund_id), data);
        };

        this.read = function(fund_id, request_id) {
            return ApiRequest.get(sprintf(uriPrefix, fund_id, request_id));
        };
    };

    return new FundRequestService();
};

module.exports = [
    'ApiRequest',
    FundRequestService
];