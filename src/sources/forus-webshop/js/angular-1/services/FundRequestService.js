let sprintf = require('sprintf-js').sprintf;

let FundRequestService = function(ApiRequest) {
    let uriPrefix = '/platform/funds/%s/requests';

    return new(function() {
        this.index = function(fund_id, data = {}) {
            return ApiRequest.get(sprintf(uriPrefix, fund_id), data);
        };

        this.store = function(fund_id, data) {
            return ApiRequest.post(sprintf(uriPrefix, fund_id), data);
        }

        this.storeValidate = function(fund_id, data) {
            return ApiRequest.post(sprintf(uriPrefix + '/validate', fund_id), data);
        }

        this.read = function(fund_id, request_id) {
            return ApiRequest.patch(sprintf(uriPrefix, fund_id, request_id));
        }
    });
};

module.exports = [
    'ApiRequest',
    FundRequestService
];