let sprintf = require('sprintf-js').sprintf;

let FundRequestClarificationService = function(ApiRequest) {
    let uriPrefix = '/platform/funds/%s/requests/%s/clarifications';

    return new(function() {
        this.index = function(fund_id, request_id, data = {}) {
            return ApiRequest.get(sprintf(uriPrefix, fund_id, request_id), data);
        };

        this.read = function(fund_id, request_id, id, data = {}) {
            return ApiRequest.get(sprintf(uriPrefix + '/%s', fund_id, request_id, id), data);
        };

        this.update = function(fund_id, request_id, id, data = {}) {
            return ApiRequest.patch(sprintf(uriPrefix + '/%s', fund_id, request_id, id), data);
        };
    });
};

module.exports = [
    'ApiRequest',
    FundRequestClarificationService
];