let sprintf = require('sprintf-js').sprintf;

let FundRequestClarificationService = function(ApiRequest) {
    let uriPrefix = '/platform/funds/%s/requests/%s/clarifications';

    return new(function() {
        this.update = function(fund_id, request_id, id, data = {}) {
            return ApiRequest.patch(sprintf(uriPrefix + '/%s', fund_id, request_id, id), data);
        };
    });
};

module.exports = [
    'ApiRequest',
    FundRequestClarificationService
];